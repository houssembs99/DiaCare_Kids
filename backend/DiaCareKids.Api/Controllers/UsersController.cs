using DiaCareKids.Api.Models;
using DiaCareKids.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DiaCareKids.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly UsersService _usersService;

        public UsersController(UsersService usersService)
        {
            _usersService = usersService;
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
            var isAdmin = User.IsInRole("Admin");

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
            }

            // Other fields
            user.ClinicType = request.ClinicType;
            user.Address = request.Address;
            user.ContactNumber = request.ContactNumber;
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
    }

    public class AdminUserRequest : User
    {
        public string? NewPassword { get; set; }
    }
}
