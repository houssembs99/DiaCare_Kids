using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;

namespace DiaCareKids.Api.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendInvoiceEmailAsync(string toEmail, string toName, string subject, string htmlBody)
        {
            var smtpHost = _configuration["EmailSettings:SmtpHost"];
            if (string.IsNullOrEmpty(smtpHost)) smtpHost = Environment.GetEnvironmentVariable("SMTP_HOST");
            if (string.IsNullOrEmpty(smtpHost)) smtpHost = "smtp.gmail.com";
            
            var smtpPortStr = _configuration["EmailSettings:SmtpPort"] ?? Environment.GetEnvironmentVariable("SMTP_PORT");
            int smtpPort = int.TryParse(smtpPortStr, out int p) ? p : 587;

            var smtpUser = _configuration["EmailSettings:SmtpUser"] ?? Environment.GetEnvironmentVariable("SMTP_USER") ?? "";
            var smtpPass = _configuration["EmailSettings:SmtpPass"] ?? Environment.GetEnvironmentVariable("SMTP_PASS") ?? "";
            var fromName = _configuration["EmailSettings:FromName"] ?? "DiaCare Kids";
            var fromEmail = _configuration["EmailSettings:FromEmail"];
            if (string.IsNullOrEmpty(fromEmail)) fromEmail = smtpUser;

            Console.WriteLine($"[EMAIL] Attempting to connect to {smtpHost}:{smtpPort} with User: {smtpUser}");

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromEmail));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder { HtmlBody = htmlBody };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            client.Timeout = 15000; // 15 seconds
            
            // Accept all certificates in case of proxy/antivirus interception
            client.ServerCertificateValidationCallback = (s, c, h, e) => true;

            var options = smtpPort == 465 
                ? MailKit.Security.SecureSocketOptions.SslOnConnect 
                : MailKit.Security.SecureSocketOptions.StartTls;

            Console.WriteLine($"[EMAIL] Connecting with {options}...");
            await client.ConnectAsync(smtpHost, smtpPort, options);

            Console.WriteLine($"[EMAIL] Authenticating...");
            await client.AuthenticateAsync(smtpUser, smtpPass);

            Console.WriteLine($"[EMAIL] Sending...");
            await client.SendAsync(message);

            Console.WriteLine($"[EMAIL] Disconnecting...");
            await client.DisconnectAsync(true);
        }
    }
}
