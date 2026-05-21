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
        private readonly TransactionsService _transactionsService;

        public StatsController(
            UsersService usersService, 
            PatientsService patientsService,
            TransactionsService transactionsService)
        {
            _usersService = usersService;
            _patientsService = patientsService;
            _transactionsService = transactionsService;
        }

        [HttpGet("summary")]
        public async Task<ActionResult> GetSummary()
        {
            // Count Doctors (Users with role Medecin)
            var doctors = await _usersService.GetByRoleAsync("Medecin");
            
            // Count Parents (Users with role Parent)
            var parents = await _usersService.GetByRoleAsync("Parent");
            
            // Count Clinics (Users with role Clinique) - Consistent with ClinicsController
            var clinics = await _usersService.GetByRoleAsync("Clinique");
            
            // Count Patients (via PatientsService)
            var patients = await _patientsService.GetAsync();
            
            // Get Transactions for revenue
            var transactions = await _transactionsService.GetAsync();

            // Total revenue in USD
            double totalRevenue = transactions.Sum(t => t.Amount) / 100.0;
            
            string formattedRevenue = totalRevenue >= 1000 
                ? (totalRevenue / 1000.0).ToString("0.0") + "k" 
                : totalRevenue.ToString("0");

            return Ok(new
            {
                DoctorsCount = doctors.Count,
                ParentsCount = parents.Count,
                PatientsCount = patients.Count,
                ClinicsCount = clinics.Count, // Real count from Users collection
                Revenue = formattedRevenue,
                ActiveSubs = parents.Count(u => u.Status == "Actif") 
            });
        }
    }
}
