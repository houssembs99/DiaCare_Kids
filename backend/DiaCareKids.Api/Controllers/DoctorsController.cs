using DiaCareKids.Api.Models;
using DiaCareKids.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DiaCareKids.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DoctorsController : ControllerBase
    {
        private readonly DoctorsService _doctorsService;

        public DoctorsController(DoctorsService doctorsService)
        {
            _doctorsService = doctorsService;
        }

        [HttpGet]
        public async Task<List<Doctor>> Get() =>
            await _doctorsService.GetAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<Doctor>> Get(string id)
        {
            var doctor = await _doctorsService.GetAsync(id);
            if (doctor == null) return NotFound();
            return doctor;
        }

        [HttpPost]
        public async Task<IActionResult> Post(Doctor newDoctor)
        {
            await _doctorsService.CreateAsync(newDoctor);
            return CreatedAtAction(nameof(Get), new { id = newDoctor.Id }, newDoctor);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Doctor updatedDoctor)
        {
            var doctor = await _doctorsService.GetAsync(id);
            if (doctor == null) return NotFound();
            
            updatedDoctor.Id = doctor.Id;
            await _doctorsService.UpdateAsync(id, updatedDoctor);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var doctor = await _doctorsService.GetAsync(id);
            if (doctor == null) return NotFound();
            
            await _doctorsService.RemoveAsync(id);
            return NoContent();
        }
    }
}
