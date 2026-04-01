using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DiaCareKids.Api.Models;
using DiaCareKids.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace DiaCareKids.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UsersService _usersService;
        private readonly IConfiguration _configuration;

        public AuthController(UsersService usersService, IConfiguration configuration)
        {
            _usersService = usersService;
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
                    return BadRequest(new { message = "Tous les champs sont obligatoires." });
                }

                if (request.Role == "Enfant")
                {
                    return BadRequest(new { message = "Les comptes enfants doivent être créés par un parent." });
                }

                var emailLower = request.Email.ToLower();
                var existingUser = await _usersService.GetByEmailAsync(emailLower);
                if (existingUser != null)
                    return BadRequest(new { message = "Cet utilisateur existe déjà." });

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
                    user.AssociatedClinicId = request.AssociatedClinicId;
                    user.Subscription = new SubscriptionDetails
                    {
                        PlanType = request.SubscriptionPlan ?? "Mensuel",
                        MaxKids = request.MaxKids > 0 ? request.MaxKids : 1,
                        ExpiryDate = (request.SubscriptionPlan == "Annuel") ? DateTime.UtcNow.AddYears(1) : DateTime.UtcNow.AddMonths(1),
                        IsActive = true
                    };
                }
                else if (request.Role == "Clinique")
                {
                    user.ClinicType = request.ClinicType;
                    user.Address = request.Address;
                    user.ContactNumber = request.ContactNumber;
                    user.Subscription = new SubscriptionDetails
                    {
                        PlanType = request.SubscriptionPlan ?? "Mensuel",
                        MaxDoctors = request.MaxDoctors,
                        MaxPatients = request.MaxPatients,
                        ExpiryDate = (request.SubscriptionPlan == "Annuel") ? DateTime.UtcNow.AddYears(1) : DateTime.UtcNow.AddMonths(1),
                        IsActive = true
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

    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? SubscriptionPlan { get; set; } // Mensuel, Annuel
        public int MaxKids { get; set; } // 1, 2, 3
        public string? AssociatedClinicId { get; set; }
        
        // Clinic registration fields
        public string? ClinicType { get; set; }
        public string? Address { get; set; }
        public string? ContactNumber { get; set; }
        public int MaxDoctors { get; set; }
        public int MaxPatients { get; set; }
    }
}
