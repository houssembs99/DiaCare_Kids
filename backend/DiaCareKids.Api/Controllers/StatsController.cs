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
            
            // Get Transactions for revenue (amounts stored directly in DT, not cents)
            var transactions = await _transactionsService.GetAsync();

            double totalRevenue = transactions.Sum(t => t.Amount);
            
            string formattedRevenue = totalRevenue >= 1000 
                ? (totalRevenue / 1000.0).ToString("0.0") + "k DT" 
                : totalRevenue.ToString("0") + " DT";

            // Count all active subscriptions across clinics and parents
            var allUsers = await _usersService.GetAsync();
            int activeSubs = allUsers.Count(u => 
                u.Subscription != null && 
                u.Subscription.IsActive == true &&
                (u.Role == "Clinique" || u.Role == "Parent" || u.Role == "Agent Clinique")
            );

            return Ok(new
            {
                DoctorsCount = doctors.Count,
                ParentsCount = parents.Count,
                PatientsCount = patients.Count,
                ClinicsCount = clinics.Count,
                Revenue = formattedRevenue,
                ActiveSubs = activeSubs
            });
        }

        [HttpGet("charts")]
        public async Task<ActionResult> GetCharts()
        {
            var transactions = await _transactionsService.GetAsync();
            var allUsers = await _usersService.GetAsync();

            // Build last 6 months labels
            var months = Enumerable.Range(0, 6)
                .Select(i => DateTime.UtcNow.AddMonths(-5 + i))
                .ToList();

            // Monthly revenue (sum of transaction amounts per month)
            var monthlyRevenue = months.Select(m =>
                transactions
                    .Where(t => t.Date.Year == m.Year && t.Date.Month == m.Month)
                    .Sum(t => t.Amount)
            ).ToList();

            // Monthly active subscriptions count (users with active sub created up to that month)
            var monthlySubs = months.Select(m =>
                allUsers.Count(u =>
                    u.Subscription != null &&
                    u.Subscription.IsActive == true &&
                    (u.Role == "Clinique" || u.Role == "Parent" || u.Role == "Agent Clinique")
                )
            ).ToList();

            var labels = months.Select(m => m.ToString("MMM", new System.Globalization.CultureInfo("fr-FR"))).ToList();

            return Ok(new
            {
                Labels = labels,
                MonthlyRevenue = monthlyRevenue,
                MonthlySubs = monthlySubs
            });
        }
    }
}
