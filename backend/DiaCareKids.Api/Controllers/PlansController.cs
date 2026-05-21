using DiaCareKids.Api.Models;
using DiaCareKids.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DiaCareKids.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlansController : ControllerBase
    {
        private readonly PlansService _plansService;

        public PlansController(PlansService plansService)
        {
            _plansService = plansService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<SubscriptionPlan>>> Get()
        {
            var plans = await _plansService.GetAsync();
            return Ok(plans);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<SubscriptionPlan>> Get(string id)
        {
            var plan = await _plansService.GetAsync(id);
            if (plan == null) return NotFound();
            return Ok(plan);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<SubscriptionPlan>> Post([FromBody] SubscriptionPlan newPlan)
        {
            if (newPlan == null) return BadRequest();
            await _plansService.CreateAsync(newPlan);
            return CreatedAtAction(nameof(Get), new { id = newPlan.Id }, newPlan);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Put(string id, [FromBody] SubscriptionPlan updatedPlan)
        {
            var plan = await _plansService.GetAsync(id);
            if (plan == null) return NotFound();

            updatedPlan.Id = plan.Id;
            await _plansService.UpdateAsync(id, updatedPlan);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(string id)
        {
            var plan = await _plansService.GetAsync(id);
            if (plan == null) return NotFound();

            await _plansService.RemoveAsync(id);
            return NoContent();
        }
    }
}
