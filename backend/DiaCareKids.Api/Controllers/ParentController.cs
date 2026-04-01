using DiaCareKids.Api.Models;
using DiaCareKids.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.RegularExpressions;
using System.Linq;

namespace DiaCareKids.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Parent")]
    public class ParentController : ControllerBase
    {
        private readonly UsersService _usersService;
        private readonly DoctorsService _doctorsService;
        private readonly ClinicsService _clinicsService;
        private readonly MedicalRecordsService _recordsService;

        public ParentController(UsersService usersService, DoctorsService doctorsService, ClinicsService clinicsService, MedicalRecordsService recordsService)
        {
            _usersService = usersService;
            _doctorsService = doctorsService;
            _clinicsService = clinicsService;
            _recordsService = recordsService;
        }

        [HttpGet("test-db")]
        public async Task<IActionResult> TestDb()
        {
            var parentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var kids = await _usersService.GetAsync();
            var myKids = await _usersService.GetByParentIdAsync(parentId!);
            
            var allRecords = await _recordsService.GetLatestForPatientsAsync(kids.Select(k => k.Id!).ToList(), 100);
            
            return Ok(new {
                ParentIdInToken = parentId,
                TotalUsersInDb = kids.Count,
                MyKidsCount = myKids.Count,
                MyKidsIds = myKids.Select(k => k.Id).ToList(),
                TotalRecordsFound = allRecords.Count,
                Records = allRecords
            });
        }
    

        [HttpGet("dashboard-summary")]
        public async Task<IActionResult> GetDashboardSummary()
        {
            var parentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(parentId)) return Unauthorized();

            Console.WriteLine($"[Dashboard] Fetching summary for parent: {parentId}");

            var parent = await _usersService.GetAsync(parentId);
            if (parent == null) return NotFound();

            var children = await _usersService.GetByParentIdAsync(parentId);
            Console.WriteLine($"[Dashboard] Found {children.Count} children for parent {parentId}");
            
            var childrenSummary = new List<object>();

            foreach (var child in children)
            {
                if (string.IsNullOrEmpty(child.FileNumber) || !Regex.IsMatch(child.FileNumber, @"^\d{5}/[A-Z]{4}$"))
                {
                    child.FileNumber = await GenerateUniqueFileNumber();
                    await _usersService.UpdateAsync(child.Id!, child);
                }

                string doctorName = "Non assigné";
                string clinicName = "Non assignée";

                if (!string.IsNullOrEmpty(child.AssociatedDoctorId))
                {
                    var doctor = await _usersService.GetAsync(child.AssociatedDoctorId);
                    if (doctor != null) doctorName = "Dr. " + doctor.FullName;
                }

                if (!string.IsNullOrEmpty(child.AssociatedClinicId))
                {
                    var clinic = await _usersService.GetAsync(child.AssociatedClinicId);
                    if (clinic != null) clinicName = clinic.FullName;
                }

                childrenSummary.Add(new
                {
                    child.Id,
                    child.FullName,
                    child.Email,
                    child.DateOfBirth,
                    child.Gender,
                    child.AssociatedDoctorId,
                    child.AssociatedClinicId,
                    child.FileNumber,
                    DoctorName = doctorName,
                    ClinicName = clinicName
                });
            }

            var kidIds = children.Select(c => c.Id!).ToList();
            Console.WriteLine($"[Dashboard] Kids IDs: {string.Join(", ", kidIds)}");
            
            var latestRecords = await _recordsService.GetLatestForPatientsAsync(kidIds, 5);
            Console.WriteLine($"[Dashboard] Found {latestRecords.Count} latest records");
            
            var latestGlucose = latestRecords.FirstOrDefault(r => r.GlucoseValue.HasValue);
            if (latestGlucose != null) {
                Console.WriteLine($"[Dashboard] Latest glucose: {latestGlucose.GlucoseValue} at {latestGlucose.Timestamp}");
            }
            
            return Ok(new
            {
                Subscription = parent.Subscription,
                Children = childrenSummary,
                LatestStats = latestGlucose != null ? new {
                    Value = latestGlucose.GlucoseValue,
                    Timestamp = latestGlucose.Timestamp,
                    ChildName = children.FirstOrDefault(c => c.Id == latestGlucose.PatientId)?.FullName
                } : null,
                RecentHistory = latestRecords.Select(r => new {
                    r.Timestamp,
                    r.GlucoseValue,
                    r.InsulinDose,
                    r.CarbsEstimated,
                    ChildName = children.FirstOrDefault(c => c.Id == r.PatientId)?.FullName
                })
            });
        }

        [HttpGet("my-clinic-doctors")]
        public async Task<IActionResult> GetMyClinicDoctors()
        {
            var parentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var parent = await _usersService.GetAsync(parentId!);
            
            if (string.IsNullOrEmpty(parent?.AssociatedClinicId))
                return Ok(new List<User>());

            var allClinicUsers = await _usersService.GetByClinicIdAsync(parent.AssociatedClinicId);
            var doctors = allClinicUsers.Where(u => u.Role == "Medecin" && u.Status == "Actif").ToList();
            return Ok(doctors);
        }

        [HttpPost("create-child")]
        public async Task<IActionResult> CreateChild([FromBody] CreateChildRequest request)
        {
            try 
            {
                var parentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(parentId)) return Unauthorized();

                var parent = await _usersService.GetAsync(parentId);
                if (parent == null || parent.Subscription == null || !parent.Subscription.IsActive)
                {
                    return BadRequest(new { message = "Un abonnement actif est requis." });
                }

                if (string.IsNullOrEmpty(parent.AssociatedClinicId))
                {
                    return BadRequest(new { message = "Veuillez d'abord être rattaché à une clinique." });
                }

                var existingChildren = await _usersService.GetByParentIdAsync(parentId);
                if (existingChildren.Count >= parent.Subscription.MaxKids)
                {
                    return BadRequest(new { message = $"Limite d'enfants atteinte ({parent.Subscription.MaxKids})." });
                }

                var emailLower = request.Email.ToLower();
                var existingUser = await _usersService.GetByEmailAsync(emailLower);
                if (existingUser != null)
                    return BadRequest(new { message = "Cet email est déjà utilisé." });

                var fileNumber = await GenerateUniqueFileNumber();

                var child = new User
                {
                    Email = emailLower,
                    FullName = request.FullName,
                    Role = "Enfant",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                    AssociatedParentId = parentId,
                    // IMPORTANT: Ensure these are null if empty to avoid BsonSerializationException
                    AssociatedClinicId = string.IsNullOrWhiteSpace(parent.AssociatedClinicId) ? null : parent.AssociatedClinicId,
                    AssociatedDoctorId = string.IsNullOrWhiteSpace(request.AssociatedDoctorId) ? null : request.AssociatedDoctorId,
                    DateOfBirth = request.DateOfBirth,
                    Gender = request.Gender,
                    FileNumber = fileNumber,
                    CreatedAt = DateTime.UtcNow,
                    Status = "Actif"
                };

                await _usersService.CreateAsync(child);

                return Ok(new { message = "Compte enfant créé avec succès", childId = child.Id, fileNumber = fileNumber });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erreur lors de la création de l'enfant.", details = ex.Message });
            }
        }

        private async Task<string> GenerateUniqueFileNumber()
        {
            const string digits = "0123456789";
            const string letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var random = new Random();
            string code;
            bool exists;

            do
            {
                var numPart = new string(Enumerable.Repeat(digits, 5)
                    .Select(s => s[random.Next(s.Length)]).ToArray());
                var letterPart = new string(Enumerable.Repeat(letters, 4)
                    .Select(s => s[random.Next(s.Length)]).ToArray());
                
                code = $"{numPart}/{letterPart}";
                
                var existing = await _usersService.GetByFileNumberAsync(code);
                exists = existing != null;
            } while (exists);

            return code;
        }

        [HttpGet("children")]
        public async Task<IActionResult> GetChildren()
        {
            try 
            {
                var parentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(parentId)) return Unauthorized();

                var children = await _usersService.GetByParentIdAsync(parentId);
                return Ok(children);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erreur lors de la récupération des enfants.", details = ex.Message });
            }
        }

        [HttpGet("migrate-files-8")]
        [Authorize(Roles = "Admin,Parent")] // Parent can run it to fix their kids
        public async Task<IActionResult> MigrateFileNumbers()
        {
            var kids = await _usersService.GetByRoleAsync("Enfant");
            int count = 0;
            foreach (var kid in kids)
            {
                if (string.IsNullOrEmpty(kid.FileNumber) || !Regex.IsMatch(kid.FileNumber, @"^\d{5}/[A-Z]{4}$"))
                {
                    kid.FileNumber = await GenerateUniqueFileNumber();
                    await _usersService.UpdateAsync(kid.Id!, kid);
                    count++;
                }
            }
            return Ok(new { message = $"{count} dossiers patients mis à jour avec le nouveau format (5 chiffres / 4 lettres)." });
        }
        [HttpPut("update-child-profile/{childId}")]
        public async Task<IActionResult> UpdateChildProfile(string childId, [FromBody] UpdateChildProfileRequest request)
        {
            var parentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var child = await _usersService.GetAsync(childId);

            if (child == null || child.AssociatedParentId != parentId)
            {
                return NotFound(new { message = "Enfant non trouvé ou non autorisé." });
            }

            child.Height = request.Height;
            child.Weight = request.Weight;
            child.Allergies = request.Allergies;
            child.DiagnosisDate = request.DiagnosisDate;
            child.DiabetesType = request.DiabetesType;

            await _usersService.UpdateAsync(childId, child);

            return Ok(new { message = "Profil médical mis à jour avec succès", child });
        }
    }

    public class UpdateChildProfileRequest
    {
        public double? Height { get; set; }
        public double? Weight { get; set; }
        public string? Allergies { get; set; }
        public DateTime? DiagnosisDate { get; set; }
        public string? DiabetesType { get; set; }
    }

    public class CreateChildRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = "H";
        public string? AssociatedDoctorId { get; set; }
    }
}
