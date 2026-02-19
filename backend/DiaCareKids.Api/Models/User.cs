using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DiaCareKids.Api.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty; // Admin, Clinique, Medecin, Parent, Enfant
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Metadata specific to roles
        public string? AssociatedClinicId { get; set; }
        public string? AssociatedDoctorId { get; set; }
        public string? AssociatedParentId { get; set; }
    }
}
