using DiaCareKids.Api.Models;
using MongoDB.Driver;

namespace DiaCareKids.Api.Services
{
    public class MessagesService
    {
        private readonly IMongoCollection<Message> _messagesCollection;

        public MessagesService(IMongoDatabase database)
        {
            _messagesCollection = database.GetCollection<Message>("Messages");
        }

        public async Task<List<Message>> GetConversationAsync(string userId1, string userId2)
        {
            var filter = Builders<Message>.Filter.Or(
                Builders<Message>.Filter.And(
                    Builders<Message>.Filter.Eq(m => m.SenderId, userId1),
                    Builders<Message>.Filter.Eq(m => m.ReceiverId, userId2)
                ),
                Builders<Message>.Filter.And(
                    Builders<Message>.Filter.Eq(m => m.SenderId, userId2),
                    Builders<Message>.Filter.Eq(m => m.ReceiverId, userId1)
                )
            );

            return await _messagesCollection.Find(filter)
                                            .SortBy(m => m.Timestamp)
                                            .ToListAsync();
        }

        public async Task<List<Message>> GetUserMessagesAsync(string userId)
        {
            var filter = Builders<Message>.Filter.Or(
                Builders<Message>.Filter.Eq(m => m.SenderId, userId),
                Builders<Message>.Filter.Eq(m => m.ReceiverId, userId)
            );

            return await _messagesCollection.Find(filter)
                                            .SortByDescending(m => m.Timestamp)
                                            .ToListAsync();
        }

        public async Task CreateAsync(Message newMessage)
        {
            newMessage.Timestamp = DateTime.UtcNow;
            await _messagesCollection.InsertOneAsync(newMessage);
        }

        public async Task MarkAsReadAsync(string messageId)
        {
            var update = Builders<Message>.Update.Set(m => m.IsRead, true);
            await _messagesCollection.UpdateOneAsync(m => m.Id == messageId, update);
        }
    }
}
