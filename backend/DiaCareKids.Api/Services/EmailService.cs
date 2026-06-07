using System.Net.Http;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace DiaCareKids.Api.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;
        private static readonly HttpClient _httpClient = new HttpClient();

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendInvoiceEmailAsync(string toEmail, string toName, string subject, string htmlBody)
        {
            var apiKey = _configuration["BrevoSettings:ApiKey"]
                ?? Environment.GetEnvironmentVariable("BREVO_API_KEY")
                ?? "";

            var fromName = _configuration["BrevoSettings:FromName"] ?? "DiaCare Kids";
            var fromEmail = _configuration["BrevoSettings:FromEmail"] ?? "diacarekids@gmail.com";

            Console.WriteLine($"[EMAIL] Envoi via Brevo API vers {toEmail}...");

            var payload = new
            {
                sender = new { name = fromName, email = fromEmail },
                to = new[] { new { email = toEmail, name = toName } },
                subject = subject,
                htmlContent = htmlBody
            };

            var json = JsonSerializer.Serialize(payload);
            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email");
            request.Headers.Add("api-key", apiKey);
            request.Content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);
            var responseBody = await response.Content.ReadAsStringAsync();

            Console.WriteLine($"[EMAIL] Brevo Status: {response.StatusCode} - {responseBody}");

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Brevo API error: {response.StatusCode} - {responseBody}");
            }

            Console.WriteLine($"[EMAIL] Envoi réussi !");
        }
    }
}
