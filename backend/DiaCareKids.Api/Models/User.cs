using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DiaCareKids.Api.Models
{
    [BsonIgnoreExtraElements]
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty; // Admin, Clinique, Medecin, Parent, Enfant
        public string Status { get; set; } = "Actif"; // Actif, Bloqué
        public string? AvatarUrl { get; set; } // Cloudinary URL
        public string? FileNumber { get; set; } // Unique 10-char code for patients
        public DateTime? LastLogin { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Profile Metadata
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; } // H, F
        public double? Weight { get; set; }
        public double? Height { get; set; }
        public string? Allergies { get; set; }
        public DateTime? DiagnosisDate { get; set; }
        public string? DiabetesType { get; set; } // Type 1, Type 2
        public string? MedicalNotes { get; set; } // Observations & Recommandations du médecin
        
        // Metadata specific to roles
        [BsonRepresentation(BsonType.ObjectId)]
        public string? AssociatedClinicId { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string? AssociatedDoctorId { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string? AssociatedParentId { get; set; }

        // Clinic/Cabinet Metadata
        public string? ClinicType { get; set; } // Clinique, Cabinet, Hopital
        public string? Address { get; set; }
        public string? ContactNumber { get; set; }
        public string? OrderNumber { get; set; } // Numéro d'Ordre / Spécialité du médecin

        // Subscription management (for Parents & Clinics)
        public SubscriptionDetails? Subscription { get; set; }

        // Gamification (For Kid role)
        public int XP { get; set; } = 0;
    }

    public class SubscriptionDetails
    {
        public string PlanType { get; set; } = "Mensuel"; // Mensuel, Annuel
        public int MaxKids { get; set; } = 1; // 1, 2, 3 (For Parents)
        public int MaxDoctors { get; set; } = 0; // 3, 7, -1 (Unlimited) (For Clinics)
        public int MaxPatients { get; set; } = 0; // 3, 10, -1 (Unlimited) (For Clinics)
        public DateTime ExpiryDate { get; set; }
        public bool IsActive { get; set; } = false;
    }
}
