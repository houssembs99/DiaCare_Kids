using DiaCareKids.Api.Models;
using DiaCareKids.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DiaCareKids.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClinicsController : ControllerBase
    {
        private readonly IUsersService _usersService;

        public ClinicsController(IUsersService usersService)
        {
            _usersService = usersService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<List<User>> Get() {
            var allUsers = await _usersService.GetAsync();
            
            // Filter: 
            // 1. All "Clinique" that are Active & Paid
            // 2. All "Medecin" that are Independent (AssociatedClinicId is null) AND Active & Paid
            var establishments = allUsers.Where(u => 
                (u.Role == "Clinique" && u.Status == "Actif" && u.Subscription != null && u.Subscription.IsActive) ||
                (u.Role == "Medecin" && string.IsNullOrEmpty(u.AssociatedClinicId) && u.Status == "Actif" && u.Subscription != null && u.Subscription.IsActive)
            ).ToList();

            return establishments;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> Get(string id)
        {
            var clinic = await _usersService.GetAsync(id);
            if (clinic == null || (clinic.Role != "Clinique" && clinic.Role != "Medecin")) return NotFound();
            return clinic;
        }

        [HttpPost]
        public async Task<IActionResult> Post(User newClinic)
        {
            newClinic.Role = "Clinique"; // New clinics from this endpoint default to Clinique role
            await _usersService.CreateAsync(newClinic);
            return CreatedAtAction(nameof(Get), new { id = newClinic.Id }, newClinic);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, User updatedClinic)
        {
            var clinic = await _usersService.GetAsync(id);
            if (clinic == null || (clinic.Role != "Clinique" && clinic.Role != "Medecin")) return NotFound();
            
            // Keep the original role
            updatedClinic.Id = clinic.Id;
            updatedClinic.Role = clinic.Role;
            await _usersService.UpdateAsync(id, updatedClinic);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var clinic = await _usersService.GetAsync(id);
            if (clinic == null || (clinic.Role != "Clinique" && clinic.Role != "Medecin")) return NotFound();
            
            await _usersService.RemoveAsync(id);
            return NoContent();
        }
    }
}
