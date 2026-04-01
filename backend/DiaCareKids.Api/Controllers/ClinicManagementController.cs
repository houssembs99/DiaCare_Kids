using DiaCareKids.Api.Models;
using DiaCareKids.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DiaCareKids.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Clinique")]
    public class ClinicManagementController : ControllerBase
    {
        private readonly UsersService _usersService;

        public ClinicManagementController(UsersService usersService)
        {
            _usersService = usersService;
        }

        private string GetCurrentUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpGet("staff")]
        public async Task<ActionResult<List<User>>> GetMyStaff()
        {
            var clinicId = GetCurrentUserId();
            var allClinicUsers = await _usersService.GetByClinicIdAsync(clinicId);
            return allClinicUsers.Where(u => u.Role == "Medecin").ToList();
        }

        [HttpGet("patients")]
        public async Task<ActionResult> GetMyPatients()
        {
            var clinicId = GetCurrentUserId();
            var allClinicUsers = await _usersService.GetByClinicIdAsync(clinicId);
            
            var allParentsInDb = await _usersService.GetByRoleAsync("Parent");
            var allChildrenInDb = await _usersService.GetByRoleAsync("Enfant");

            var parents = allClinicUsers.Where(u => u.Role == "Parent").ToList();
            var children = allClinicUsers.Where(u => u.Role == "Enfant").ToList();

            Console.WriteLine($"[CLINIC LOG] ClinicID: {clinicId}");
            Console.WriteLine($"[CLINIC LOG] Total Parents in DB: {allParentsInDb.Count}");
            Console.WriteLine($"[CLINIC LOG] Total Children in DB: {allChildrenInDb.Count}");
            Console.WriteLine($"[CLINIC LOG] Linked to this Clinic: {allClinicUsers.Count} (P: {parents.Count}, E: {children.Count})");

            var result = parents.Select(p => new {
                parent = p,
                children = children.Where(c => c.AssociatedParentId == p.Id).ToList()
            }).ToList();

            return Ok(result);
        }

        [HttpPost("assign-doctor")]
        public async Task<IActionResult> AssignDoctor([FromBody] AssignDoctorRequest request)
        {
            var clinicId = GetCurrentUserId();
            
            // Verify patient belongs to clinic
            var patient = await _usersService.GetAsync(request.PatientId);
            if (patient == null || patient.AssociatedClinicId != clinicId)
                return NotFound(new { message = "Patient non trouvé ou n'appartient pas à cette clinique." });

            // Verify doctor belongs to clinic and is active
            var doctor = await _usersService.GetAsync(request.DoctorId);
            if (doctor == null || doctor.AssociatedClinicId != clinicId || doctor.Status != "Actif")
                return BadRequest(new { message = "Médecin invalide ou non actif dans votre établissement." });

            patient.AssociatedDoctorId = request.DoctorId;
            await _usersService.UpdateAsync(request.PatientId, patient);

            return Ok(new { message = $"Le médecin {doctor.FullName} a été associé avec succès." });
        }

        public class AssignDoctorRequest
        {
            public string PatientId { get; set; } = string.Empty;
            public string DoctorId { get; set; } = string.Empty;
        }

        [HttpGet("stats")]
        public async Task<ActionResult> GetStats()
        {
            var clinicId = GetCurrentUserId();
            var clinic = await _usersService.GetAsync(clinicId);
            if (clinic == null) return NotFound();

            var allClinicUsers = await _usersService.GetByClinicIdAsync(clinicId);
            var activeDoctors = allClinicUsers.Count(u => u.Role == "Medecin" && u.Status == "Actif");
            var totalParents = allClinicUsers.Count(u => u.Role == "Parent");

            return Ok(new
            {
                usedDoctors = activeDoctors,
                maxDoctors = (clinic.Subscription?.MaxDoctors == 0) ? 3 : (clinic.Subscription?.MaxDoctors ?? 3),
                usedPatients = totalParents,
                maxPatients = (clinic.Subscription?.MaxPatients == 0) ? 3 : (clinic.Subscription?.MaxPatients ?? 3),
                planType = clinic.Subscription?.PlanType ?? "Standard",
                expiryDate = clinic.Subscription?.ExpiryDate,
                clinicName = clinic.FullName,
                type = clinic.ClinicType
            });
        }

        [HttpPost("approve-doctor/{id}")]
        public async Task<IActionResult> ApproveDoctor(string id)
        {
            var clinicId = GetCurrentUserId();
            var clinic = await _usersService.GetAsync(clinicId);
            if (clinic == null) return NotFound();

            var doc = await _usersService.GetAsync(id);
            if (doc == null || doc.AssociatedClinicId != clinicId) return NotFound();

            // Check Quota
            var allClinicUsers = await _usersService.GetByClinicIdAsync(clinicId);
            var activeDoctors = allClinicUsers.Count(u => u.Role == "Medecin" && u.Status == "Actif");
            
            var maxDocs = clinic.Subscription?.MaxDoctors ?? 0;
            
            // Fallback for clinics created before the subscription system or with 0 limit
            if (maxDocs == 0) maxDocs = 3; 

            if (maxDocs != -1 && activeDoctors >= maxDocs)
            {
                return BadRequest(new { message = "Limite de médecins atteinte pour votre abonnement." });
            }

            doc.Status = "Actif";
            await _usersService.UpdateAsync(id, doc);
            return Ok(new { message = "Médecin approuvé." });
        }

        [HttpPost("reject-doctor/{id}")]
        public async Task<IActionResult> RejectDoctor(string id)
        {
            var clinicId = GetCurrentUserId();
            var doc = await _usersService.GetAsync(id);
            if (doc == null || doc.AssociatedClinicId != clinicId) return NotFound();

            doc.Status = "Rejeté";
            await _usersService.UpdateAsync(id, doc);
            return Ok(new { message = "Demande rejetée." });
        }
    }
}
