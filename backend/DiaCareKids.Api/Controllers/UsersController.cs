using DiaCareKids.Api.Models;
using DiaCareKids.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DiaCareKids.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly UsersService _usersService;
        private readonly IPhotoService _photoService;
        private readonly TransactionsService _transactionsService;
        private readonly ClinicPackagesService _packagesService;

        public UsersController(UsersService usersService, IPhotoService photoService, TransactionsService transactionsService, ClinicPackagesService packagesService)
        {
            _usersService = usersService;
            _photoService = photoService;
            _transactionsService = transactionsService;
            _packagesService = packagesService;
        }

        [HttpGet]
        public async Task<List<User>> GetAll() => 
            await _usersService.GetAsync();

        [HttpGet("role/{role}")]
        public async Task<List<User>> GetByRole(string role) => 
            await _usersService.GetByRoleAsync(role);

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> Get(string id)
        {
            var user = await _usersService.GetAsync(id);
            if (user == null) return NotFound();

            if (user.Role == "Parent" && user.Subscription != null && user.Subscription.PlanType == "Sous Clinique" && !string.IsNullOrEmpty(user.AssociatedClinicId))
            {
                var clinic = await _usersService.GetAsync(user.AssociatedClinicId);
                if (clinic == null || clinic.Status != "Actif" || clinic.Subscription == null || !clinic.Subscription.IsActive)
                {
                    user.Subscription.IsActive = false;
                }
            }

            return user;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Post(AdminUserRequest request)
        {
            var user = new User
            {
                Email = request.Email.ToLower(),
                FullName = request.FullName,
                Role = request.Role,
                Status = request.Status,
                PasswordHash = string.IsNullOrEmpty(request.NewPassword) 
                    ? BCrypt.Net.BCrypt.HashPassword("DiaCare123!") // Default password
                    : BCrypt.Net.BCrypt.HashPassword(request.NewPassword),
                CreatedAt = DateTime.UtcNow,
                AssociatedClinicId = request.AssociatedClinicId,
                AssociatedDoctorId = request.AssociatedDoctorId,
                AssociatedParentId = request.AssociatedParentId,
                ClinicType = request.ClinicType,
                Address = request.Address,
                ContactNumber = request.ContactNumber
            };

            await _usersService.CreateAsync(user);
            return CreatedAtAction(nameof(Get), new { id = user.Id }, user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, AdminUserRequest request)
        {
            var user = await _usersService.GetAsync(id);
            if (user == null) return NotFound();

            // Authorization: Only Admin or the user themselves
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var isAdmin = User.IsInRole("Admin") || User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value == "Admin";

            if (!isAdmin && currentUserId != id) return Forbid();

            // Update allowed fields
            user.Email = request.Email.ToLower();
            user.FullName = request.FullName;
            
            if (isAdmin)
            {
                user.Role = request.Role;
                user.Status = request.Status;
                user.AssociatedClinicId = request.AssociatedClinicId;
                user.AssociatedDoctorId = request.AssociatedDoctorId;
                user.AssociatedParentId = request.AssociatedParentId;
                
                if (!string.IsNullOrEmpty(request.NewPassword))
                {
                    user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                }
                
                if (request.Subscription != null)
                {
                    user.Subscription = request.Subscription;
                }
            }

            // Other fields
            user.ClinicType = request.ClinicType;
            user.Address = request.Address;
            user.ContactNumber = request.ContactNumber;
            user.OrderNumber = request.OrderNumber;
            user.Gender = request.Gender;
            user.DateOfBirth = request.DateOfBirth;

            await _usersService.UpdateAsync(id, user);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(string id)
        {
            var user = await _usersService.GetAsync(id);
            if (user == null) return NotFound();
            
            await _usersService.RemoveAsync(id);
            return NoContent();
        }

        [HttpPatch("{id}/subscription")]
        [Authorize(Roles = "Admin,Clinique,Medecin")]
        public async Task<IActionResult> UpdateSubscription(string id, [FromBody] SubscriptionUpdateRequest request)
        {
            var user = await _usersService.GetAsync(id);
            if (user == null) return NotFound();

            if (user.Subscription == null)
                user.Subscription = new SubscriptionDetails();

            user.Subscription.IsActive = request.IsActive;
            user.Subscription.PlanType = request.PlanType ?? user.Subscription.PlanType ?? "Basic";
            user.Subscription.ExpiryDate = request.ExpiryDate ?? user.Subscription.ExpiryDate;
            user.Status = request.IsActive ? "Actif" : "En Attente";

            await _usersService.UpdateAsync(id, user);

            // === AUTO-TRANSACTION: When a doctor/clinic activates a parent subscription ===
            var callerRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var callerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (request.IsActive && (callerRole == "Medecin" || callerRole == "Clinique") && !string.IsNullOrEmpty(callerId))
            {
                // Look up the package price from doctor/clinic's packages
                var providerPackages = await _packagesService.GetByClinicIdAsync(callerId);
                var matchedPkg = providerPackages.FirstOrDefault(p =>
                    p.Name.Equals(user.Subscription.PlanType, StringComparison.OrdinalIgnoreCase));

                if (matchedPkg == null && providerPackages.Any())
                {
                    // Fallback to the first available package if the specific one is not found or it's a new parent
                    matchedPkg = providerPackages.First();
                }

                // If no packages exist at all, fallback to a standard pricing of 80 DT (8000 cents)
                long amountCentimes = matchedPkg != null ? (long)(matchedPkg.Price * 100) : 8000;
                string finalPlanName = matchedPkg != null ? matchedPkg.Name : (user.Subscription.PlanType ?? "Standard");

                // Update the user's plan to the successfully matched one to keep data consistent
                user.Subscription.PlanType = finalPlanName;
                await _usersService.UpdateAsync(id, user);

                var transaction = new Transaction
                {
                    UserId = callerId, // Revenue belongs to the provider
                    UserFullName = user.FullName, // Patient/Parent name for reference
                    Role = callerRole,
                    AssociatedClinicId = callerId,
                    Amount = amountCentimes,
                    PlanName = finalPlanName,
                    PaymentIntentId = $"manual_{id}_{DateTime.UtcNow.Ticks}",
                    Date = DateTime.UtcNow,
                    Status = "Payé"
                };
                await _transactionsService.CreateAsync(transaction);
            }

            return Ok(new { message = "Statut mis à jour", isActive = user.Subscription.IsActive, status = user.Status });
        }

        [HttpPost("upload-avatar/{id}")]
        [Authorize]
        public async Task<IActionResult> UploadAvatar(string id, IFormFile file)
        {
            var user = await _usersService.GetAsync(id);
            if (user == null) return NotFound("Utilisateur non trouvé.");

            // Check if current user is authorized (Admin or self)
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (currentUserRole != "Admin" && currentUserId != id) return Forbid();

            var result = await _photoService.AddPhotoAsync(file);

            if (result.Error != null) return BadRequest(result.Error.Message);

            // Update user with new AvatarUrl
            user.AvatarUrl = result.SecureUrl.AbsoluteUri;
            await _usersService.UpdateAsync(id, user);

            return Ok(new { avatarUrl = user.AvatarUrl });
        }

        [HttpPost("{id}/add-xp")]
        [Authorize]
        public async Task<IActionResult> AddXP(string id, [FromBody] AddXpRequest request)
        {
            var user = await _usersService.GetAsync(id);
            if (user == null) return NotFound("Utilisateur non trouvé.");

            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var isAdmin = User.IsInRole("Admin") || User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value == "Admin";
            
            if (!isAdmin && currentUserId != id) return Forbid();

            user.XP += request.XP;
            await _usersService.UpdateAsync(id, user);

            return Ok(new { xp = user.XP });
        }
    }

    public class AdminUserRequest : User
    {
        public string? NewPassword { get; set; }
    }

    public class SubscriptionUpdateRequest
    {
        public bool IsActive { get; set; }
        public string? PlanType { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
    }

    public class AddXpRequest
    {
        public int XP { get; set; }
    }
}
