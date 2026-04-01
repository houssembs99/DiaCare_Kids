using DiaCareKids.Api.Models;
using MongoDB.Driver;

namespace DiaCareKids.Api.Services
{
    public class PatientsService
    {
        private readonly IMongoCollection<Patient> _patientsCollection;

        public PatientsService(IMongoDatabase database)
        {
            _patientsCollection = database.GetCollection<Patient>("Patients");
        }

        public async Task<List<Patient>> GetAsync() =>
            await _patientsCollection.Find(_ => true).ToListAsync();

        public async Task<List<Patient>> GetByDoctorAsync(string doctorId) =>
            await _patientsCollection.Find(x => x.DoctorId == doctorId).ToListAsync();

        public async Task<Patient?> GetAsync(string id) =>
            await _patientsCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(Patient newPatient) =>
            await _patientsCollection.InsertOneAsync(newPatient);

        public async Task UpdateAsync(string id, Patient updatedPatient) =>
            await _patientsCollection.ReplaceOneAsync(x => x.Id == id, updatedPatient);
    }
}
