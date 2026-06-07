using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DiaCareKids.Api.Services;

namespace DiaCareKids.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvoicesController : ControllerBase
    {
        private readonly EmailService _emailService;

        public InvoicesController(EmailService emailService)
        {
            _emailService = emailService;
        }

        public class SendInvoiceRequest
        {
            public string ToEmail { get; set; } = string.Empty;
            public string ToName { get; set; } = string.Empty;
            public string Subject { get; set; } = "Votre facture DiaCare Kids";
            public string HtmlBody { get; set; } = string.Empty;
        }

        [HttpPost("send")]
        [Authorize]
        public async Task<IActionResult> SendInvoice([FromBody] SendInvoiceRequest request)
        {
            if (string.IsNullOrEmpty(request.ToEmail) || string.IsNullOrEmpty(request.HtmlBody))
                return BadRequest(new { error = "Email et contenu de la facture sont requis." });

            try
            {
                await _emailService.SendInvoiceEmailAsync(
                    request.ToEmail,
                    request.ToName,
                    request.Subject,
                    request.HtmlBody
                );

                return Ok(new { message = "Facture envoyée avec succès par email." });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = $"Erreur lors de l'envoi de l'email : {ex.Message}" });
            }
        }
    }
}
