using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace DiaCareKids.Api.Models
{
    public class Message
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string SenderId { get; set; } = string.Empty;
        public string SenderName { get; set; } = string.Empty;
        
        [BsonRepresentation(BsonType.ObjectId)]
        public string ReceiverId { get; set; } = string.Empty;
        public string ReceiverName { get; set; } = string.Empty;

        public string Content { get; set; } = string.Empty;

        // Attachment support
        public string? AttachmentUrl { get; set; }
        public string? AttachmentType { get; set; } // "image" | "file"

        public bool IsRead { get; set; } = false;

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
