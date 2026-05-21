using DiaCareKids.Api.Models;
using DiaCareKids.Api.Configuration;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace DiaCareKids.Api.Services
{
    public class ClinicPackagesService
    {
        private readonly IMongoCollection<ClinicPackage> _packagesCollection;

        public ClinicPackagesService(IMongoDatabase database)
        {
            _packagesCollection = database.GetCollection<ClinicPackage>("ClinicPackages");
        }

        public async Task<List<ClinicPackage>> GetByClinicIdAsync(string clinicId) =>
            await _packagesCollection.Find(x => x.ClinicId == clinicId).ToListAsync();

        public async Task<ClinicPackage?> GetAsync(string id) =>
            await _packagesCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(ClinicPackage newPackage) =>
            await _packagesCollection.InsertOneAsync(newPackage);

        public async Task UpdateAsync(string id, ClinicPackage updatedPackage) =>
            await _packagesCollection.ReplaceOneAsync(x => x.Id == id, updatedPackage);

        public async Task RemoveAsync(string id) =>
            await _packagesCollection.DeleteOneAsync(x => x.Id == id);
    }
}
