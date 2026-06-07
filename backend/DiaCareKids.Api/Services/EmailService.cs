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
            var smtpHost = _configuration["EmailSettings:SmtpHost"] ?? Environment.GetEnvironmentVariable("SMTP_HOST") ?? "smtp.gmail.com";
            var smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? Environment.GetEnvironmentVariable("SMTP_PORT") ?? "587");
            var smtpUser = _configuration["EmailSettings:SmtpUser"] ?? Environment.GetEnvironmentVariable("SMTP_USER") ?? "";
            var smtpPass = _configuration["EmailSettings:SmtpPass"] ?? Environment.GetEnvironmentVariable("SMTP_PASS") ?? "";
            var fromName = _configuration["EmailSettings:FromName"] ?? "DiaCare Kids";
            var fromEmail = _configuration["EmailSettings:FromEmail"] ?? smtpUser;

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromEmail));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder { HtmlBody = htmlBody };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(smtpHost, smtpPort, MailKit.Security.SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(smtpUser, smtpPass);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}
