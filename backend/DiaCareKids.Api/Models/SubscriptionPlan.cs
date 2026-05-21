using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace DiaCareKids.Api.Models
{
    public class SubscriptionPlan
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string Name { get; set; } = string.Empty; // Ex: Basic, Pro, Premium, Solo, Duo, Famille, Sous Clinique
        public double Price { get; set; }
        public string Currency { get; set; } = "dt"; // $, €, dt
        public string Duration { get; set; } = "Mensuel"; // Mensuel, Annuel
        public string Role { get; set; } = "Clinique"; // Clinique, Parent
        public int MaxDoctors { get; set; } = 0; // -1 pour illimité
        public int MaxPatients { get; set; } = 0; // -1 pour illimité
        public int MaxKids { get; set; } = 0; // Pour les parents (Solo: 1, Duo: 2, Famille: 3)
        public List<string> Features { get; set; } = new();
        public string Color { get; set; } = string.Empty;
        public string IconName { get; set; } = "Shield";
        public bool IsPopular { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
