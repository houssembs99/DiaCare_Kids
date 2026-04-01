using DiaCareKids.Api.Models;
using MongoDB.Driver;

namespace DiaCareKids.Api.Services
{
    public class MedicalRecordsService
    {
        private readonly IMongoCollection<MedicalRecord> _recordsCollection;

        public MedicalRecordsService(IMongoDatabase database)
        {
            _recordsCollection = database.GetCollection<MedicalRecord>("MedicalRecords");
        }

        public async Task<List<MedicalRecord>> GetByPatientAsync(string patientId) =>
            await _recordsCollection.Find(x => x.PatientId == patientId)
                                     .SortByDescending(x => x.Timestamp)
                                     .ToListAsync();

        public async Task CreateAsync(MedicalRecord newRecord) =>
            await _recordsCollection.InsertOneAsync(newRecord);

        public async Task<List<MedicalRecord>> GetLatestForPatientsAsync(List<string> patientIds, int limit = 5)
        {
            var filter = Builders<MedicalRecord>.Filter.In(x => x.PatientId, patientIds);
            return await _recordsCollection.Find(filter)
                                         .SortByDescending(x => x.Timestamp)
                                         .Limit(limit)
                                         .ToListAsync();
        }
    }
}
