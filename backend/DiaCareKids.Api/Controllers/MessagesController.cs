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

        public MessagesController(MessagesService messagesService)
        {
            _messagesService = messagesService;
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
}
