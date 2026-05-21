using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DiaCareKids.Api.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace DiaCareKids.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly StripeService _stripeService;
        private readonly UsersService _usersService;
        private readonly TransactionsService _transactionsService;
        private readonly PlansService _plansService;

        public PaymentsController(StripeService stripeService, UsersService usersService, TransactionsService transactionsService, PlansService plansService)
        {
            _stripeService = stripeService;
            _usersService = usersService;
            _transactionsService = transactionsService;
            _plansService = plansService;
        }

        public class CheckoutRequest
        {
            public string PlanName { get; set; } = string.Empty;
            public long Amount { get; set; } // Amount in cents
            public string Currency { get; set; } = "eur";
        }

        [HttpPost("create-checkout-session")]
        [Authorize]
        public async Task<IActionResult> CreateCheckoutSession([FromBody] CheckoutRequest request)
        {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized(new { message = "User email not found in token." });
            }

            try
            {
                var session = await _stripeService.CreateSubscriptionCheckoutSessionAsync(userEmail, request.PlanName, request.Amount, request.Currency);
                return Ok(new { url = session.Url });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        public class InvoiceRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public long Amount { get; set; } // Amount in cents
            public string Currency { get; set; } = "eur";
        }

        [HttpPost("send-invoice")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SendInvoice([FromBody] InvoiceRequest request)
        {
            try
            {
                var invoice = await _stripeService.SendInvoiceAsync(request.Email, request.Description, request.Amount, request.Currency);
                return Ok(new { message = "Invoice sent successfully.", invoiceUrl = invoice.HostedInvoiceUrl });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        public class PaymentIntentRequest
        {
            public long Amount { get; set; } // Amount in cents
            public string Currency { get; set; } = "eur";
        }

        [HttpPost("create-payment-intent")]
        [Authorize]
        public async Task<IActionResult> CreatePaymentIntent([FromBody] PaymentIntentRequest request)
        {
            try
            {
                var paymentIntent = await _stripeService.CreatePaymentIntentAsync(request.Amount, request.Currency);
                return Ok(new { clientSecret = paymentIntent.ClientSecret });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        public class ConfirmSubscriptionRequest
        {
            public string PaymentIntentId { get; set; } = string.Empty;
            public long Amount { get; set; } = 19999;
            public string PlanName { get; set; } = "Clinique";
        }

        [HttpPost("confirm-subscription")]
        [Authorize]
        public async Task<IActionResult> ConfirmSubscription([FromBody] ConfirmSubscriptionRequest request)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var user = await _usersService.GetAsync(userId);
            if (user == null) return NotFound();

            // Fetch capabilities and limits dynamically from MongoDB for the selected plan name
            var plan = await _plansService.GetByNameAndRoleAsync(request.PlanName, user.Role);
            int maxDocs = 3;
            int maxPats = 3;
            int maxKids = 1;

            if (plan != null)
            {
                maxDocs = plan.MaxDoctors;
                maxPats = plan.MaxPatients;
                maxKids = plan.MaxKids;
            }
            else
            {
                // Fallbacks
                if (user.Role == "Clinique")
                {
                    if (request.PlanName.ToLower() == "pro") { maxDocs = 10; maxPats = 500; }
                    else if (request.PlanName.ToLower() == "premium") { maxDocs = 50; maxPats = -1; }
                }
                else if (user.Role == "Parent")
                {
                    if (request.PlanName.ToLower() == "duo") maxKids = 2;
                    else if (request.PlanName.ToLower() == "famille") maxKids = 3;
                }
            }

            user.Subscription = new Models.SubscriptionDetails
            {
                PlanType = request.PlanName,
                MaxDoctors = maxDocs,
                MaxPatients = maxPats,
                MaxKids = maxKids,
                ExpiryDate = System.DateTime.UtcNow.AddMonths(1),
                IsActive = true
            };
            user.Status = "Actif"; // Ensure the user is fully active!

            await _usersService.UpdateAsync(userId, user);

            // Create Transaction record
            var clinicId = (user.Role == "Clinique") ? user.Id! : (user.AssociatedClinicId ?? "");
            var transaction = new Models.Transaction
            {
                UserId = user.Id!,
                UserFullName = user.FullName,
                Role = user.Role,
                AssociatedClinicId = clinicId,
                Amount = request.Amount,
                PlanName = request.PlanName,
                PaymentIntentId = request.PaymentIntentId,
                Date = System.DateTime.UtcNow,
                Status = "Payé"
            };

            await _transactionsService.CreateAsync(transaction);

            return Ok(new { message = "Subscription activated and transaction recorded successfully" });
        }

        public class PresentialPaymentRequest
        {
            public string ClinicId { get; set; } = string.Empty;
        }

        [HttpPost("confirm-presential-payment")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ConfirmPresentialPayment([FromBody] PresentialPaymentRequest request)
        {
            if (string.IsNullOrEmpty(request.ClinicId)) return BadRequest(new { message = "ID de la clinique requis." });

            var user = await _usersService.GetAsync(request.ClinicId);
            if (user == null || user.Role != "Clinique") return NotFound(new { message = "Clinique non trouvée." });

            var planName = user.Subscription?.PlanType ?? "Basic";
            var plan = await _plansService.GetByNameAndRoleAsync(planName, "Clinique");
            int maxDocs = 3;
            int maxPats = 3;
            double price = 49;
            string currency = "dt";

            if (plan != null)
            {
                maxDocs = plan.MaxDoctors;
                maxPats = plan.MaxPatients;
                price = plan.Price;
                currency = plan.Currency;
            }

            user.Status = "Actif";
            user.Subscription = new Models.SubscriptionDetails
            {
                PlanType = planName,
                MaxDoctors = maxDocs,
                MaxPatients = maxPats,
                ExpiryDate = System.DateTime.UtcNow.AddMonths(1),
                IsActive = true
            };

            await _usersService.UpdateAsync(request.ClinicId, user);

            // Create Transaction record for presential payment
            var transaction = new Models.Transaction
            {
                UserId = user.Id!,
                UserFullName = user.FullName,
                Role = user.Role,
                AssociatedClinicId = user.Id!,
                Amount = (long)(price * 100), // En centimes
                PlanName = planName,
                PaymentIntentId = "presential_" + System.Guid.NewGuid().ToString().Substring(0, 8),
                Date = System.DateTime.UtcNow,
                Status = "Payé (Présentiel)"
            };

            await _transactionsService.CreateAsync(transaction);

            return Ok(new { message = "Paiement en présentiel confirmé et clinique activée avec succès !" });
        }
    }
}
