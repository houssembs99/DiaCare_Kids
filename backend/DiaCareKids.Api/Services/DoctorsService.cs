using DiaCareKids.Api.Models;
using MongoDB.Driver;

namespace DiaCareKids.Api.Services
{
    public class DoctorsService
    {
        private readonly IMongoCollection<Doctor> _doctorsCollection;

        public DoctorsService(IMongoDatabase database)
        {
            _doctorsCollection = database.GetCollection<Doctor>("Doctors");
        }

        public async Task<List<Doctor>> GetAsync() =>
            await _doctorsCollection.Find(_ => true).ToListAsync();

        public async Task<Doctor?> GetAsync(string id) =>
            await _doctorsCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task<List<Doctor>> GetByClinicIdAsync(string clinicId) =>
            await _doctorsCollection.Find(x => x.ClinicId == clinicId).ToListAsync();

        public async Task CreateAsync(Doctor newDoctor) =>
            await _doctorsCollection.InsertOneAsync(newDoctor);

        public async Task UpdateAsync(string id, Doctor updatedDoctor) =>
            await _doctorsCollection.ReplaceOneAsync(x => x.Id == id, updatedDoctor);

        public async Task RemoveAsync(string id) =>
            await _doctorsCollection.DeleteOneAsync(x => x.Id == id);
    }
}
