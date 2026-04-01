using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DiaCareKids.Api.Models
{
    public class Clinic
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string Name { get; set; } = string.Empty;
        public string Manager { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int Doctors { get; set; } = 0;
        public int Patients { get; set; } = 0;
        public string Subscription { get; set; } = "Pro";
        public string Status { get; set; } = "Active";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
