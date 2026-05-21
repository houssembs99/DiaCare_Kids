using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace DiaCareKids.Api.Models
{
    public class ClinicPackage
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string ClinicId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty; // Pack Suivi Complet, Pack Basique, etc.
        public double Price { get; set; }
        public string Currency { get; set; } = "dt"; // TND, EUR
        public string PaymentFrequency { get; set; } = "Mensuel"; // Mensuel, Consultation, Trimestriel, etc.
        public List<string> Services { get; set; } = new(); // e.g. "Chat en direct avec médecin", "1 visite par mois"
        public int MaxKidsPerParent { get; set; } = 1; 

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
