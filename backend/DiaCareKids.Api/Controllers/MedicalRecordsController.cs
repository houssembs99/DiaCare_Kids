using DiaCareKids.Api.Models;
using DiaCareKids.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DiaCareKids.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MedicalRecordsController : ControllerBase
    {
        private readonly MedicalRecordsService _recordsService;
        private readonly UsersService _usersService;
        private readonly DecisionSupportService _decisionSupport;
        private readonly GlucosePredictionService _predictionService;

        public MedicalRecordsController(
            MedicalRecordsService recordsService, 
            UsersService usersService,
            DecisionSupportService decisionSupport,
            GlucosePredictionService predictionService)
        {
            _recordsService = recordsService;
            _usersService = usersService;
            _decisionSupport = decisionSupport;
            _predictionService = predictionService;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] MedicalRecord record)
        {
            try 
            {
                if (string.IsNullOrEmpty(record.PatientId))
                    return BadRequest(new { message = "L'Id de l'enfant est requis." });

                // IMPORTANT: Sanitize to avoid BsonSerializationException if it was non-hex
                record.PatientId = string.IsNullOrWhiteSpace(record.PatientId) ? null : record.PatientId;
                if (record.PatientId == null) return BadRequest(new { message = "Id de l'enfant invalide." });

                await _recordsService.CreateAsync(record);

                // Analyse automatique immédiate
                var kid = await _usersService.GetAsync(record.PatientId);
                if (kid != null && record.GlucoseValue.HasValue)
                {
                    var analysis = _decisionSupport.AnalyzeRecord(record, kid);
                    
                    // --- INTELLIGENCE ARTIFICIELLE ---
                    float? prediction = null;
                    string? predictionMsg = null;
                    try 
                    {
                        var val = _predictionService.Predict(
                            (float)record.GlucoseValue.Value,
                            (float)(record.CarbsEstimated ?? 0),
                            (float)(record.InsulinDose ?? 0),
                            record.Timing ?? "before",
                            record.ActivityLevel ?? "Faible");
                        
                        prediction = val;
                        predictionMsg = $"L'IA DiaPote prévoit une glycémie de {val:0} mg/dL à la prochaine mesure.";
                    }
                    catch (Exception ex)
                    { 
                        Console.WriteLine($"[IA ERROR] Prediction failed: {ex.Message}");
                    }

                    // --- GAMIFICATION: Increment XP ---
                    kid.XP += 10;
                    await _usersService.UpdateAsync(kid.Id!, kid);

                    return Ok(new { 
                        record, 
                        analysis,
                        aiPrediction = prediction,
                        aiMessage = predictionMsg,
                        xpGained = 10,
                        totalXp = kid.XP
                    });
                }

                return Ok(record);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[POST ERROR] MedicalRecord creation failed: {ex.Message}");
                return StatusCode(500, new { message = "Erreur lors de la création de la mesure.", details = ex.Message });
            }
        }

        [HttpGet("patient/{patientId}")]
        public async Task<List<MedicalRecord>> Get(string patientId) => 
            await _recordsService.GetByPatientAsync(patientId);
    }
}
