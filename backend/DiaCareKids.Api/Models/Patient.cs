using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DiaCareKids.Api.Models
{
    public class Patient
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string FullName { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public DateTime DiagnosisDate { get; set; }
        public string DiabetesType { get; set; } = "Type 1";
        
        public string ParentId { get; set; } = string.Empty;
        public string DoctorId { get; set; } = string.Empty;
        public string ClinicId { get; set; } = string.Empty;

        public GlucoseTargets Targets { get; set; } = new GlucoseTargets();
        
        public string CurrentTreatment { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class GlucoseTargets
    {
        public double Min { get; set; } = 70; // mg/dL
        public double Max { get; set; } = 150; // mg/dL
        public double AlertLow { get; set; } = 60;
        public double AlertHigh { get; set; } = 250;
    }
}
