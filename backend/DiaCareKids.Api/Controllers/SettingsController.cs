using DiaCareKids.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DiaCareKids.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class SettingsController : ControllerBase
    {
        private readonly IPhotoService _photoService;

        public SettingsController(IPhotoService photoService)
        {
            _photoService = photoService;
        }

        [HttpPost("upload-logo")]
        public async Task<IActionResult> UploadLogo(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { error = "Aucun fichier fourni." });

            var allowedTypes = new[] { "image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp" };
            if (!allowedTypes.Contains(file.ContentType))
                return BadRequest(new { error = "Format non supporté. Utilisez PNG, JPG, SVG ou WebP." });

            if (file.Length > 5 * 1024 * 1024)
                return BadRequest(new { error = "Fichier trop volumineux. Taille maximale : 5 Mo." });

            var result = await _photoService.AddPhotoAsync(file);

            if (result.Error != null)
                return BadRequest(new { error = result.Error.Message });

            return Ok(new { logoUrl = result.SecureUrl.AbsoluteUri });
        }
    }
}
