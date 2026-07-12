using DiaCareKids.Api.Models;
using DiaCareKids.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DiaCareKids.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize(Roles = "Admin")] // Depending on auth requirement, you can uncomment this
    public class LogsController : ControllerBase
    {
        private readonly LogsService _logsService;

        public LogsController(LogsService logsService)
        {
            _logsService = logsService;
        }

        [HttpGet]
        public async Task<ActionResult<List<SystemLog>>> Get()
        {
            var logs = await _logsService.GetAllAsync();
            return Ok(logs);
        }

        [HttpPost]
        public async Task<IActionResult> Create(SystemLog log)
        {
            await _logsService.CreateAsync(log);
            return Ok();
        }
    }
}
