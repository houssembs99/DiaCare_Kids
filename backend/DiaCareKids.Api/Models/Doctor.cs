using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DiaCareKids.Api.Models
{
    public class Doctor
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string Name { get; set; } = string.Empty;
        public string Clinic { get; set; } = string.Empty; // Clinic Name
        public string? ClinicId { get; set; } // Associated Clinic ID
        public string Email { get; set; } = string.Empty;
        public int Patients { get; set; } = 0;
        public string Subscription { get; set; } = "Pro"; // Basic, Pro, Premium
        public string Status { get; set; } = "Actif"; // Actif, En Congé, Inactif

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
