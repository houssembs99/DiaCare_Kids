using DiaCareKids.Api.Configuration;
using DiaCareKids.Api.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace DiaCareKids.Api.Services
{
    public class TransactionsService
    {
        private readonly IMongoCollection<Transaction> _transactionsCollection;

        public TransactionsService(IMongoDatabase database)
        {
            _transactionsCollection = database.GetCollection<Transaction>("Transactions");
        }

        public async Task<List<Transaction>> GetAsync() =>
            await _transactionsCollection.Find(_ => true).ToListAsync();

        public async Task<List<Transaction>> GetByUserAsync(string userId) =>
            await _transactionsCollection.Find(x => x.UserId == userId).ToListAsync();

        public async Task<List<Transaction>> GetByClinicAsync(string clinicId) =>
            await _transactionsCollection.Find(x => x.AssociatedClinicId == clinicId || x.UserId == clinicId).ToListAsync();

        public async Task CreateAsync(Transaction transaction) =>
            await _transactionsCollection.InsertOneAsync(transaction);
    }
}
