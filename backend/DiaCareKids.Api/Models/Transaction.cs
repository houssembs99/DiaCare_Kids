using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace DiaCareKids.Api.Models
{
    public class Transaction
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string UserId { get; set; } = string.Empty;
        public string UserFullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        
        public string AssociatedClinicId { get; set; } = string.Empty; // To allow clinic to see it
        
        public long Amount { get; set; } // En centimes
        public string PlanName { get; set; } = string.Empty;
        public string PaymentIntentId { get; set; } = string.Empty;

        public DateTime Date { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Payé";
    }
}
