using Microsoft.AspNetCore.Mvc;
using DiaCareKids.Api.Services;

namespace DiaCareKids.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PredictionController : ControllerBase
    {
        private readonly GlucosePredictionService _predictionService;

        public PredictionController(GlucosePredictionService predictionService)
        {
            _predictionService = predictionService;
        }

        [HttpGet("train")]
        public IActionResult Train()
        {
            try
            {
                _predictionService.TrainModel();
                return Ok(new { message = "Modèle ML entraîné et sauvegardé avec succès !" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("test")]
        public IActionResult TestPrediction([FromQuery] float glucose, [FromQuery] float carbs, [FromQuery] float insulin)
        {
            try
            {
                var prediction = _predictionService.Predict(glucose, carbs, insulin);
                return Ok(new { 
                    currentValue = glucose, 
                    predictedNext = prediction,
                    trend = prediction > glucose ? "En hausse ↗" : "En baisse ↘"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
