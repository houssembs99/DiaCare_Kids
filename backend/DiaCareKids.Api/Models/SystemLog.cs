using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DiaCareKids.Api.Models
{
    public class SystemLog
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string Action { get; set; } = string.Empty;
        public string User { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // Danger, Sensible, Info, Urgent
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public string Device { get; set; } = string.Empty;
    }
}
