using DiaCareKids.Api.Models;
using DiaCareKids.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DiaCareKids.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PatientsController : ControllerBase
    {
        private readonly PatientsService _patientsService;

        public PatientsController(PatientsService patientsService)
        {
            _patientsService = patientsService;
        }

        [HttpGet]
        public async Task<List<Patient>> Get() => await _patientsService.GetAsync();

        [HttpGet("doctor/{doctorId}")]
        public async Task<List<Patient>> GetByDoctor(string doctorId) => 
            await _patientsService.GetByDoctorAsync(doctorId);

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Patient patient)
        {
            await _patientsService.CreateAsync(patient);
            return CreatedAtAction(nameof(Get), new { id = patient.Id }, patient);
        }
    }
}
