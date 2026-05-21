using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DiaCareKids.Api.Services;
using DiaCareKids.Api.Models;
using Microsoft.AspNetCore.Authorization;

namespace DiaCareKids.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TransactionsController : ControllerBase
    {
        private readonly TransactionsService _transactionsService;

        public TransactionsController(TransactionsService transactionsService)
        {
            _transactionsService = transactionsService;
        }

        [HttpGet]
        public async Task<List<Transaction>> GetAll() =>
            await _transactionsService.GetAsync();

        [HttpGet("user/{userId}")]
        public async Task<List<Transaction>> GetByUser(string userId) =>
            await _transactionsService.GetByUserAsync(userId);

        [HttpGet("clinic/{clinicId}")]
        public async Task<List<Transaction>> GetByClinic(string clinicId) =>
            await _transactionsService.GetByClinicAsync(clinicId);
    }
}
