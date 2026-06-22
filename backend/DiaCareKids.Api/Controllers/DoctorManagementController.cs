using DiaCareKids.Api.Models;
using DiaCareKids.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DiaCareKids.Api.Controllers
{
    [ApiController]
    [Route("api/doctor-management")]
    [Authorize(Roles = "Medecin")]
    public class DoctorManagementController : ControllerBase
    {
        private readonly UsersService _usersService;
        private readonly MedicalRecordsService _recordsService;

        public DoctorManagementController(UsersService usersService, MedicalRecordsService recordsService)
        {
            _usersService = usersService;
            _recordsService = recordsService;
            Console.WriteLine("[DOCTOR LOG] DoctorManagementController initialized.");
        }

        private string GetCurrentUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpGet("patients")]
        public async Task<ActionResult> GetMyPatients()
        {
            var doctorId = GetCurrentUserId();
            
            // 1. Get patients directly assigned to me
            var directPatients = await _usersService.GetByDoctorIdAsync(doctorId);
            
            // 2. Find siblings: Get all kids of parents who are rattachés to me (as Doctor or Clinic)
            var allUsers = await _usersService.GetAsync();
            var myParents = allUsers.Where(u => u.Role == "Parent" && (u.AssociatedDoctorId == doctorId || u.AssociatedClinicId == doctorId)).ToList();
            var kidsOfMyParents = allUsers.Where(u => u.Role == "Enfant" && myParents.Any(parent => parent.Id == u.AssociatedParentId)).ToList();

            // Unique set of patients
            var allPatients = directPatients.Concat(kidsOfMyParents)
                .Where(u => u.Role == "Enfant")
                .GroupBy(p => p.Id)
                .Select(g => g.First())
                .ToList();
            
            var result = new List<object>();
            foreach (var p in allPatients)
            {
                var records = await _recordsService.GetByPatientAsync(p.Id!);
                var lastRecord = records.FirstOrDefault();
                
                string parentName = "Parent inconnu";
                if (!string.IsNullOrEmpty(p.AssociatedParentId)) {
                    var parent = await _usersService.GetAsync(p.AssociatedParentId);
                    parentName = parent?.FullName ?? "Parent inconnu";
                }
                
                result.Add(new
                {
                    p.Id,
                    p.FullName,
                    p.FileNumber,
                    p.DateOfBirth,
                    p.Status,
                    p.AssociatedParentId,
                    ParentFullName = parentName,
                    LastGlucose = lastRecord?.GlucoseValue,
                    MedicalNotes = p.MedicalNotes
                });
            }

            return Ok(result);
        }

        [HttpGet("patients/{id}")]
        public async Task<ActionResult> GetPatientDetail(string id)
        {
            var doctorId = GetCurrentUserId();
            var patient = await _usersService.GetAsync(id);
            
            if (patient == null)
                return NotFound(new { message = "Patient non trouvé." });

            // Allow access if directly assigned OR if parent is rattaché to this doctor
            bool isDirectlyAssigned = patient.AssociatedDoctorId == doctorId;
            bool isThroughParent = false;
            User? parent = null;

            if (!string.IsNullOrEmpty(patient.AssociatedParentId))
            {
                parent = await _usersService.GetAsync(patient.AssociatedParentId);
                if (parent != null && (parent.AssociatedDoctorId == doctorId || parent.AssociatedClinicId == doctorId))
                {
                    isThroughParent = true;
                }
            }

            if (!isDirectlyAssigned && !isThroughParent)
                return NotFound(new { message = "Ce patient n'est pas sous votre suivi." });

            var records = await _recordsService.GetByPatientAsync(id);

            return Ok(new
            {
                Patient = patient,
                Parent = parent,
                Records = records
            });
        }
        [HttpPut("update-patient-profile/{patientId}")]
        public async Task<IActionResult> UpdatePatientProfile(string patientId, [FromBody] UpdateChildProfileRequest request)
        {
            var doctorId = GetCurrentUserId();
            var patient = await _usersService.GetAsync(patientId);

            if (patient == null || patient.AssociatedDoctorId != doctorId)
            {
                return NotFound(new { message = "Patient non trouvé ou non autorisé." });
            }

            patient.Height = request.Height;
            patient.Weight = request.Weight;
            patient.Allergies = request.Allergies;
            patient.DiagnosisDate = request.DiagnosisDate;
            patient.DiabetesType = request.DiabetesType;

            await _usersService.UpdateAsync(patientId, patient);

            return Ok(new { message = "Profil médical mis à jour avec succès", patient });
        }
        [HttpPut("update-medical-notes/{patientId}")]
        public async Task<IActionResult> UpdateMedicalNotes(string patientId, [FromBody] UpdateNotesRequest request)
        {
            var doctorId = GetCurrentUserId();
            var patient = await _usersService.GetAsync(patientId);

            if (patient == null)
                return NotFound(new { message = "Patient non trouvé." });

            // Allow direct assignment OR through parent link
            bool isDirectlyAssigned = patient.AssociatedDoctorId == doctorId;
            bool isThroughParent = false;
            if (!string.IsNullOrEmpty(patient.AssociatedParentId))
            {
                var parent = await _usersService.GetAsync(patient.AssociatedParentId);
                if (parent != null && (parent.AssociatedDoctorId == doctorId || parent.AssociatedClinicId == doctorId))
                    isThroughParent = true;
            }

            if (!isDirectlyAssigned && !isThroughParent)
                return Forbid();

            // Append new notes (prepend so latest is first), don't overwrite history
            var timestamp = DateTime.UtcNow.ToString("dd/MM/yyyy");
            var newEntry = $"[{timestamp}] {request.Notes}";
            patient.MedicalNotes = string.IsNullOrEmpty(patient.MedicalNotes)
                ? newEntry
                : newEntry + "\n---\n" + patient.MedicalNotes;

            await _usersService.UpdateAsync(patientId, patient);

            return Ok(new { message = "Notes médicales mises à jour avec succès", patient });
        }

        [HttpDelete("patients/{id}")]
        public async Task<IActionResult> RemovePatient(string id)
        {
            var doctorId = GetCurrentUserId();
            var patient = await _usersService.GetAsync(id);
            
            if (patient == null)
                return NotFound(new { message = "Patient non trouvé." });

            bool isDirectlyAssigned = patient.AssociatedDoctorId == doctorId;
            bool isThroughParent = false;

            if (!string.IsNullOrEmpty(patient.AssociatedParentId))
            {
                var parent = await _usersService.GetAsync(patient.AssociatedParentId);
                if (parent != null && (parent.AssociatedDoctorId == doctorId || parent.AssociatedClinicId == doctorId))
                {
                    isThroughParent = true;
                }
            }

            if (!isDirectlyAssigned && !isThroughParent)
            {
                return NotFound(new { message = "Patient non autorisé." });
            }

            await _usersService.RemoveAsync(id);

            return Ok(new { message = "Patient supprimé avec succès." });
        }

        [HttpPost("register-family")]
        public async Task<IActionResult> RegisterFamily([FromBody] RegisterFamilyRequest request)
        {
            var doctorId = GetCurrentUserId();

            // --- 1. Validate email uniqueness ---
            var existing = await _usersService.GetByEmailAsync(request.ParentEmail.ToLower());
            if (existing != null)
                return BadRequest(new { error = "Un compte avec cet email existe déjà." });

            // --- 2. Create Parent account ---
            var parent = new User
            {
                Email = request.ParentEmail.ToLower(),
                FullName = request.ParentFullName,
                Role = "Parent",
                Status = "Actif",
                ContactNumber = request.ParentPhone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(string.IsNullOrEmpty(request.ParentPassword) ? "DiaCare123!" : request.ParentPassword),
                AssociatedDoctorId = doctorId,
                CreatedAt = DateTime.UtcNow,
                Subscription = new SubscriptionDetails
                {
                    PlanType = "Standard",
                    MaxKids = 3,
                    IsActive = false,
                    ExpiryDate = DateTime.UtcNow.AddMonths(1)
                }
            };
            await _usersService.CreateAsync(parent);

            // --- 3. Optionally create Child account ---
            User? child = null;
            if (!string.IsNullOrWhiteSpace(request.ChildFullName))
            {
                var fileNumber = $"DC-{DateTime.UtcNow.Year}-{Guid.NewGuid().ToString()[..6].ToUpper()}";
                child = new User
                {
                    Email = $"enfant.{Guid.NewGuid().ToString()[..8]}@diacare.local",
                    FullName = request.ChildFullName,
                    Role = "Enfant",
                    Status = "Actif",
                    FileNumber = fileNumber,
                    DateOfBirth = request.ChildDateOfBirth,
                    Gender = request.ChildGender,
                    DiabetesType = request.DiabetesType ?? "Type 1",
                    AssociatedParentId = parent.Id,
                    AssociatedDoctorId = doctorId,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("DiaCare123!"),
                    CreatedAt = DateTime.UtcNow
                };
                await _usersService.CreateAsync(child);
            }

            return Ok(new
            {
                message = "Famille inscrite avec succès.",
                parentId = parent.Id,
                parentEmail = parent.Email,
                childId = child?.Id,
                childFileNumber = child?.FileNumber
            });
        }

        [HttpGet("stats")]
        public async Task<ActionResult> GetStats()
        {
            var doctorId = GetCurrentUserId();
            var patients = await _usersService.GetByDoctorIdAsync(doctorId);
            
            return Ok(new
            {
                totalPatients = patients.Count,
                alerts = 0 // Mock for now
            });
        }
    }

    public class UpdateNotesRequest
    {
        public string? Notes { get; set; }
    }

    public class UpdateChildProfileRequest
    {
        public double? Height { get; set; }
        public double? Weight { get; set; }
        public string? Allergies { get; set; }
        public DateTime? DiagnosisDate { get; set; }
        public string? DiabetesType { get; set; }
    }

    public class RegisterFamilyRequest
    {
        public string ParentFullName { get; set; } = string.Empty;
        public string ParentEmail { get; set; } = string.Empty;
        public string? ParentPhone { get; set; }
        public string? ParentPassword { get; set; }

        // Optional child
        public string? ChildFullName { get; set; }
        public DateTime? ChildDateOfBirth { get; set; }
        public string? ChildGender { get; set; }
        public string? DiabetesType { get; set; }
    }
}
