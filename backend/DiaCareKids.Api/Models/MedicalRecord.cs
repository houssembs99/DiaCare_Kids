using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DiaCareKids.Api.Models
{
    public class MedicalRecord
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string PatientId { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // Glycemia
        public double? GlucoseValue { get; set; } // mg/dL
        public string? Timing { get; set; } // Avant repas, Après repas, Au coucher, etc.

        // Insulin
        public double? InsulinDose { get; set; }
        public string? InsulinType { get; set; } // Rapide, Lente

        // Nutrition
        public double? CarbsEstimated { get; set; } // grams
        public string? MealDescription { get; set; }

        // Activity
        public string? ActivityLevel { get; set; } // Faible, Modérée, Intense
        public int? ActivityDurationMinutes { get; set; }

        // Symptoms
        public List<string> Symptoms { get; set; } = new List<string>();

        public string? Notes { get; set; }
        
        public string CreatedBy { get; set; } = "Parent"; // Usually Parent
    }
}
