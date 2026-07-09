using DiaCareKids.Api.Models;
using DiaCareKids.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DiaCareKids.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MessagesController : ControllerBase
    {
        private readonly MessagesService _messagesService;
        private readonly IUsersService _usersService;

        public MessagesController(MessagesService messagesService, IUsersService usersService)
        {
            _messagesService = messagesService;
            _usersService = usersService;
        }

        // === PUBLIC CONTACT FORM ===
        [HttpPost("contact")]
        [AllowAnonymous]
        public async Task<IActionResult> SendContactMessage([FromBody] ContactMessageRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Content))
                return BadRequest("Tous les champs sont obligatoires.");

            // Find admin account
            var allUsers = await _usersService.GetAsync();
            var admin = allUsers.FirstOrDefault(u => u.Role == "Admin");
            if (admin == null) return StatusCode(500, "Aucun administrateur trouvé.");

            // Use a zero ObjectId as conventional placeholder for anonymous/public senders
            const string publicSenderId = "000000000000000000000000";

            var message = new Message
            {
                SenderId = publicSenderId,
                SenderName = $"{request.Name} <{request.Email}>",
                ReceiverId = admin.Id!,
                ReceiverName = admin.FullName,
                Content = request.Content,
                IsRead = false,
                Timestamp = DateTime.UtcNow
            };

            await _messagesService.CreateAsync(message);
            return Ok(new { success = true, message = "Message envoyé avec succès." });
        }

        // === ADMIN: view all contact messages ===
        [HttpGet("contact")]
        [Authorize(Roles = "Admin")]
        public async Task<List<Message>> GetContactMessages()
        {
            const string publicSenderId = "000000000000000000000000";
            var allMessages = await _messagesService.GetAllAsync();
            return allMessages.Where(m => m.SenderId == publicSenderId).OrderByDescending(m => m.Timestamp).ToList();
        }

        [HttpGet("conversation/{userId1}/{userId2}")]
        public async Task<List<Message>> GetConversation(string userId1, string userId2)
        {
            return await _messagesService.GetConversationAsync(userId1, userId2);
        }

        [HttpGet("user/{userId}")]
        public async Task<List<Message>> GetUserMessages(string userId)
        {
            return await _messagesService.GetUserMessagesAsync(userId);
        }

        [HttpPost]
        public async Task<IActionResult> SendMessage(Message newMessage)
        {
            await _messagesService.CreateAsync(newMessage);
            return CreatedAtAction(nameof(SendMessage), new { id = newMessage.Id }, newMessage);
        }

        [HttpPut("read/{messageId}")]
        public async Task<IActionResult> MarkAsRead(string messageId)
        {
            await _messagesService.MarkAsReadAsync(messageId);
            return NoContent();
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadAttachment(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Aucun fichier fourni.");

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var ext = Path.GetExtension(file.FileName);
            var uniqueName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadsFolder, uniqueName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var url = $"{Request.Scheme}://{Request.Host}/uploads/{uniqueName}";
            var type = file.ContentType.StartsWith("image/") ? "image" : "file";

            return Ok(new { url, type, fileName = file.FileName });
        }
    }

    public record ContactMessageRequest(string Name, string Email, string Content);
}
