using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DiaCareKids.Api.Models;
using DiaCareKids.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;

namespace DiaCareKids.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UsersService _usersService;
        private readonly PlansService _plansService;
        private readonly ClinicPackagesService _clinicPackagesService;
        private readonly IConfiguration _configuration;

        public AuthController(UsersService usersService, PlansService plansService, ClinicPackagesService clinicPackagesService, IConfiguration configuration)
        {
            _usersService = usersService;
            _plansService = plansService;
            _clinicPackagesService = clinicPackagesService;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password) || 
                    string.IsNullOrEmpty(request.FullName) || string.IsNullOrEmpty(request.Role))
                {
                    Console.WriteLine("[AUTH BAD_REQUEST] Tous les champs sont obligatoires.");
                    return BadRequest(new { message = "Tous les champs sont obligatoires." });
                }

                if (request.Role == "Enfant")
                {
                    Console.WriteLine("[AUTH BAD_REQUEST] Les comptes enfants doivent être créés par un parent.");
                    return BadRequest(new { message = "Les comptes enfants doivent être créés par un parent." });
                }

                var emailLower = request.Email.ToLower();
                var existingUser = await _usersService.GetByEmailAsync(emailLower);
                if (existingUser != null)
                {
                    Console.WriteLine($"[AUTH BAD_REQUEST] Cet utilisateur existe déjà: {emailLower}");
                    return BadRequest(new { message = "Cet utilisateur existe déjà." });
                }

                var user = new User
                {
                    Email = emailLower,
                    FullName = request.FullName,
                    Role = request.Role,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                    CreatedAt = DateTime.UtcNow
                };

                if (request.Role == "Parent")
                {
                    if (request.SubscriptionPlan == "Sous Clinique" || !string.IsNullOrEmpty(request.AssociatedClinicId))
                    {
                        if (string.IsNullOrEmpty(request.AssociatedClinicId))
                        {
                            Console.WriteLine("[AUTH BAD_REQUEST] Vous devez choisir une clinique.");
                            return BadRequest(new { message = "Vous devez choisir une clinique." });
                        }
                        var clinic = await _usersService.GetAsync(request.AssociatedClinicId);
                        if (clinic == null)
                        {
                            Console.WriteLine($"[AUTH BAD_REQUEST] La clinique sélectionnée est introuvable: {request.AssociatedClinicId}");
                            return BadRequest(new { message = "La clinique sélectionnée est introuvable." });
                        }
                        if (clinic.Status != "Actif" || clinic.Subscription == null || !clinic.Subscription.IsActive)
                        {
                            Console.WriteLine($"[AUTH BAD_REQUEST] Cette clinique n'est pas active pour le moment: {clinic.Id} (Status: {clinic.Status}, SubActive: {clinic.Subscription?.IsActive})");
                            return BadRequest(new { message = "Cette clinique n'est pas active pour le moment." });
                        }
                        
                        // Check Clinic Capacity Quota
                        var allClinicUsers = await _usersService.GetByClinicIdAsync(clinic.Id!);
                        var activeParents = allClinicUsers.Count(u => u.Role == "Parent" && u.Status == "Actif");
                        var maxPatients = clinic.Subscription.MaxPatients == 0 ? 3 : clinic.Subscription.MaxPatients;
                        
                        if (maxPatients != -1 && activeParents >= maxPatients)
                        {
                            Console.WriteLine($"[AUTH BAD_REQUEST] La clinique sélectionnée a atteint son quota maximal de patients: {activeParents} >= {maxPatients}");
                            return BadRequest(new { message = "La clinique sélectionnée a atteint son quota maximal de patients." });
                        }

                        user.AssociatedClinicId = request.AssociatedClinicId;
                        user.Status = "En Attente"; // Free parent waits for clinic approval
                        
                        var subscriptionName = "Sous Clinique";
                        var maxKidsForParent = request.MaxKids > 0 ? request.MaxKids : 1;

                        if (!string.IsNullOrEmpty(request.ClinicPackageId))
                        {
                            var clinicPackage = await _clinicPackagesService.GetAsync(request.ClinicPackageId);
                            if (clinicPackage != null && clinicPackage.ClinicId == request.AssociatedClinicId)
                            {
                                subscriptionName = clinicPackage.Name;
                                maxKidsForParent = clinicPackage.MaxKidsPerParent;
                            }
                        }

                        user.Subscription = new SubscriptionDetails
                        {
                            PlanType = subscriptionName,
                            MaxKids = maxKidsForParent,
                            ExpiryDate = clinic.Subscription.ExpiryDate,
                            IsActive = false
                        };
                    }
                    else
                    {
                        // Personal Plan (Solo, Duo, Famille)
                        var planName = request.SubscriptionPlan ?? "Solo";
                        var plan = await _plansService.GetByNameAndRoleAsync(planName, "Parent");
                        int maxKids = 1;
                        if (plan != null)
                        {
                            maxKids = plan.MaxKids;
                        }
                        else
                        {
                            if (planName.ToLower() == "duo") maxKids = 2;
                            else if (planName.ToLower() == "famille") maxKids = 3;
                        }

                        user.Status = "Actif"; // Active account but inactive subscription until paid
                        user.Subscription = new SubscriptionDetails
                        {
                            PlanType = planName,
                            MaxKids = maxKids,
                            ExpiryDate = DateTime.UtcNow.AddMonths(1),
                            IsActive = false // Demands Stripe online payment
                        };
                    }
                }
                else if (request.Role == "Clinique")
                {
                    var planName = request.SubscriptionPlan ?? "Basic";
                    var plan = await _plansService.GetByNameAndRoleAsync(planName, "Clinique");
                    int maxDocs = 3;
                    int maxPats = 3;
                    if (plan != null)
                    {
                        maxDocs = plan.MaxDoctors;
                        maxPats = plan.MaxPatients;
                    }
                    else
                    {
                        if (planName.ToLower() == "pro") { maxDocs = 10; maxPats = 500; }
                        else if (planName.ToLower() == "premium") { maxDocs = 50; maxPats = -1; }
                    }

                    user.ClinicType = request.ClinicType;
                    user.Address = request.Address;
                    user.ContactNumber = request.ContactNumber;

                    if (request.PaymentMethod?.ToLower() == "presentiel")
                    {
                        user.Status = "En Attente"; // Offline payment pending approval
                    }
                    else
                    {
                        user.Status = "Actif"; // Stripe checkout session path
                    }

                    user.Subscription = new SubscriptionDetails
                    {
                        PlanType = planName,
                        MaxDoctors = maxDocs,
                        MaxPatients = maxPats,
                        ExpiryDate = DateTime.UtcNow.AddMonths(1),
                        IsActive = false // Payment activates it
                    };
                }
                else if (request.Role == "Medecin")
                {
                    if (!string.IsNullOrEmpty(request.AssociatedClinicId))
                    {
                        user.AssociatedClinicId = request.AssociatedClinicId;
                        user.Status = "En Attente"; // Must be accepted by clinic
                    }
                }

                await _usersService.CreateAsync(user);

                return Ok(new { message = "Registration successful" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in Register: {ex.Message}");
                return StatusCode(500, new { message = $"Erreur interne du serveur: {ex.Message}" });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                {
                    return BadRequest(new { message = "Email et mot de passe requis." });
                }

                var emailLower = request.Email.ToLower();
                var user = await _usersService.GetByEmailAsync(emailLower);
                
                if (user == null) {
                    Console.WriteLine($"[AUTH LOG] User not found: {emailLower}");
                    return Unauthorized(new { message = "Identifiants invalides." });
                }

                if (string.IsNullOrEmpty(user.PasswordHash)) {
                    Console.WriteLine($"[AUTH LOG] User has no password hash: {emailLower}");
                    return Unauthorized(new { message = "Cet utilisateur n'a pas de mot de passe défini. Utilisez le formulaire d'inscription." });
                }

                if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash)) {
                    Console.WriteLine($"[AUTH LOG] Password mismatch for: {emailLower}");
                    return Unauthorized(new { message = "Identifiants invalides." });
                }

                if (user.Status == "En Attente")
                {
                    Console.WriteLine($"[AUTH LOG] Pending account login attempt: {emailLower}");
                    if (user.Role == "Clinique")
                        return Unauthorized(new { message = "Votre clinique est en attente de validation administrative suite à un choix de paiement en présentiel." });
                    else if (user.Role == "Parent")
                        return Unauthorized(new { message = "Votre compte parent est en attente d'approbation par la clinique choisie." });
                    else
                        return Unauthorized(new { message = "Votre compte est en attente d'approbation par la clinique choisie." });
                }

                if (user.Status == "Bloqué" || user.Status == "Rejeté")
                {
                    Console.WriteLine($"[AUTH LOG] Suspended account login attempt: {emailLower}");
                    return Unauthorized(new { message = $"Votre compte est {user.Status.ToLower()}." });
                }

                Console.WriteLine($"[AUTH LOG] Login successful: {emailLower} (Role: {user.Role})");
                var token = GenerateJwtToken(user);
                return Ok(new { token, role = user.Role, fullName = user.FullName, id = user.Id });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in Login: {ex.Message}");
                return StatusCode(500, new { message = $"Erreur interne du serveur: {ex.Message}" });
            }
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId)) return Unauthorized();

                var user = await _usersService.GetAsync(userId);
                if (user == null) return NotFound();

                if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                {
                    return BadRequest(new { message = "Le mot de passe actuel est incorrect." });
                }

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                await _usersService.UpdateAsync(userId, user);

                return Ok(new { message = "Mot de passe modifié avec succès." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erreur interne du serveur: {ex.Message}" });
            }
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.GetValue<string>("Secret")!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id!),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("FullName", user.FullName)
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings.GetValue<string>("Issuer"),
                audience: jwtSettings.GetValue<string>("Audience"),
                claims: claims,
                expires: DateTime.Now.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? SubscriptionPlan { get; set; } // Basic, Pro, Premium, Solo, Duo, Famille, Sous Clinique
        public string? PaymentMethod { get; set; } // stripe, presentiel
        public int MaxKids { get; set; } // 1, 2, 3
        public string? AssociatedClinicId { get; set; }
        public string? ClinicPackageId { get; set; }
        
        // Clinic registration fields
        public string? ClinicType { get; set; }
        public string? Address { get; set; }
        public string? ContactNumber { get; set; }
        public int MaxDoctors { get; set; }
        public int MaxPatients { get; set; }
    }
}
