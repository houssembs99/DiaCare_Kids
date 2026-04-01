using DiaCareKids.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using DiaCareKids.Api.Models;

namespace DiaCareKids.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StatsController : ControllerBase
    {
        private readonly UsersService _usersService;
        private readonly PatientsService _patientsService;

        public StatsController(UsersService usersService, PatientsService patientsService)
        {
            _usersService = usersService;
            _patientsService = patientsService;
        }

        [HttpGet("summary")]
        public async Task<ActionResult> GetSummary()
        {
            var doctors = await _usersService.GetByRoleAsync("Medecin");
            var parents = await _usersService.GetByRoleAsync("Parent");
            var patients = await _patientsService.GetAsync();

            return Ok(new
            {
                DoctorsCount = doctors.Count,
                ParentsCount = parents.Count,
                PatientsCount = patients.Count,
                ClinicsCount = 12 // Mock constant for now
            });
        }
    }
}
