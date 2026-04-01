using DiaCareKids.Api.Models;
using MongoDB.Driver;

namespace DiaCareKids.Api.Services
{
    public class ClinicsService
    {
        private readonly IMongoCollection<Clinic> _clinicsCollection;

        public ClinicsService(IMongoDatabase database)
        {
            _clinicsCollection = database.GetCollection<Clinic>("Clinics");
        }

        public async Task<List<Clinic>> GetAsync() =>
            await _clinicsCollection.Find(_ => true).ToListAsync();

        public async Task<Clinic?> GetAsync(string id) =>
            await _clinicsCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(Clinic newClinic) =>
            await _clinicsCollection.InsertOneAsync(newClinic);

        public async Task UpdateAsync(string id, Clinic updatedClinic) =>
            await _clinicsCollection.ReplaceOneAsync(x => x.Id == id, updatedClinic);

        public async Task RemoveAsync(string id) =>
            await _clinicsCollection.DeleteOneAsync(x => x.Id == id);
    }
}
