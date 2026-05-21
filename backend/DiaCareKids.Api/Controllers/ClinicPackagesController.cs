using DiaCareKids.Api.Models;
using DiaCareKids.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DiaCareKids.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClinicPackagesController : ControllerBase
    {
        private readonly ClinicPackagesService _packagesService;
        private readonly UsersService _usersService;

        public ClinicPackagesController(ClinicPackagesService packagesService, UsersService usersService)
        {
            _packagesService = packagesService;
            _usersService = usersService;
        }

        private string GetCurrentUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        // Public OR authenticated for Parents during registration
        [HttpGet("clinic/{clinicId}")]
        [AllowAnonymous]
        public async Task<ActionResult<List<ClinicPackage>>> GetClinicPackages(string clinicId)
        {
            var packages = await _packagesService.GetByClinicIdAsync(clinicId);
            return packages.Where(p => p.IsActive).ToList();
        }

        [HttpGet]
        [Authorize(Roles = "Clinique")]
        public async Task<ActionResult<List<ClinicPackage>>> GetMyPackages()
        {
            var clinicId = GetCurrentUserId();
            return await _packagesService.GetByClinicIdAsync(clinicId);
        }

        [HttpPost]
        [Authorize(Roles = "Clinique")]
        public async Task<IActionResult> CreatePackage(ClinicPackage package)
        {
            var clinicId = GetCurrentUserId();
            package.ClinicId = clinicId;
            package.CreatedAt = DateTime.UtcNow;

            await _packagesService.CreateAsync(package);
            return Ok(package);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Clinique")]
        public async Task<IActionResult> UpdatePackage(string id, ClinicPackage package)
        {
            var clinicId = GetCurrentUserId();
            var existingPackage = await _packagesService.GetAsync(id);

            if (existingPackage == null || existingPackage.ClinicId != clinicId)
            {
                return NotFound();
            }

            package.Id = id;
            package.ClinicId = clinicId;
            package.CreatedAt = existingPackage.CreatedAt;

            await _packagesService.UpdateAsync(id, package);
            return Ok(package);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Clinique")]
        public async Task<IActionResult> DeletePackage(string id)
        {
            var clinicId = GetCurrentUserId();
            var existingPackage = await _packagesService.GetAsync(id);

            if (existingPackage == null || existingPackage.ClinicId != clinicId)
            {
                return NotFound();
            }

            // We could just deactivate it to avoid breaking historic subscriptions
            existingPackage.IsActive = false;
            await _packagesService.UpdateAsync(id, existingPackage);
            return Ok(new { message = "Pack désactivé avec succès." });
        }
    }
}
