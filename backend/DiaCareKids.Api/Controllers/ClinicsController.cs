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
        private readonly UsersService _usersService;

        public ClinicsController(UsersService usersService)
        {
            _usersService = usersService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<List<User>> Get() =>
            await _usersService.GetByRoleAsync("Clinique");

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> Get(string id)
        {
            var clinic = await _usersService.GetAsync(id);
            if (clinic == null || clinic.Role != "Clinique") return NotFound();
            return clinic;
        }

        [HttpPost]
        public async Task<IActionResult> Post(User newClinic)
        {
            newClinic.Role = "Clinique";
            await _usersService.CreateAsync(newClinic);
            return CreatedAtAction(nameof(Get), new { id = newClinic.Id }, newClinic);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, User updatedClinic)
        {
            var clinic = await _usersService.GetAsync(id);
            if (clinic == null || clinic.Role != "Clinique") return NotFound();
            
            updatedClinic.Id = clinic.Id;
            updatedClinic.Role = "Clinique";
            await _usersService.UpdateAsync(id, updatedClinic);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var clinic = await _usersService.GetAsync(id);
            if (clinic == null || clinic.Role != "Clinique") return NotFound();
            
            await _usersService.RemoveAsync(id);
            return NoContent();
        }
    }
}
