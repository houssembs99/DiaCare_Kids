using DiaCareKids.Api.Models;
using DiaCareKids.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DiaCareKids.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DebugController : ControllerBase
    {
        private readonly MedicalRecordsService _recordsService;
        private readonly UsersService _usersService;

        public DebugController(MedicalRecordsService recordsService, UsersService usersService)
        {
            _recordsService = recordsService;
            _usersService = usersService;
        }

        [HttpGet("all-records")]
        public async Task<IActionResult> GetAllRecords()
        {
            var users = await _usersService.GetAsync();
            var totalRecords = 0;
            // Since we don't have GetLatestForPatients without limit, we'll try to find any for all users
            var records = await _recordsService.GetLatestForPatientsAsync(users.Select(u => u.Id!).ToList(), 1000);
            
            return Ok(new {
                UserCount = users.Count,
                RecordCount = records.Count,
                SampleRecords = records.Take(10),
                Users = users.Select(u => new { u.Id, u.FullName, u.Role, u.AssociatedParentId })
            });
        }
    }
}
