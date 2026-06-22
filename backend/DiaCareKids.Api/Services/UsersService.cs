using DiaCareKids.Api.Models;
using MongoDB.Driver;

namespace DiaCareKids.Api.Services
{
    public class UsersService : IUsersService
    {
        private readonly IMongoCollection<User> _usersCollection;

        public UsersService(IMongoDatabase database)
        {
            _usersCollection = database.GetCollection<User>("Users");
        }

        public async Task<List<User>> GetAsync() =>
            await _usersCollection.Find(_ => true).ToListAsync();

        public async Task<List<User>> GetByRoleAsync(string role) =>
            await _usersCollection.Find(x => x.Role == role).ToListAsync();

        public async Task<User?> GetAsync(string id) =>
            await _usersCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task<User?> GetByEmailAsync(string email) =>
            await _usersCollection.Find(x => x.Email == email).FirstOrDefaultAsync();

        public async Task<List<User>> GetByParentIdAsync(string parentId) =>
            await _usersCollection.Find(x => x.AssociatedParentId == parentId).ToListAsync();

        public async Task<List<User>> GetByClinicIdAsync(string clinicId) =>
            await _usersCollection.Find(x => x.AssociatedClinicId == clinicId).ToListAsync();

        public async Task<List<User>> GetByDoctorIdAsync(string doctorId) =>
            await _usersCollection.Find(x => x.AssociatedDoctorId == doctorId).ToListAsync();

        public async Task<User?> GetByFileNumberAsync(string fileNumber) =>
            await _usersCollection.Find(x => x.FileNumber == fileNumber).FirstOrDefaultAsync();

        public async Task CreateAsync(User newUser) =>
            await _usersCollection.InsertOneAsync(newUser);

        public async Task UpdateAsync(string id, User updatedUser) =>
            await _usersCollection.ReplaceOneAsync(x => x.Id == id, updatedUser);

        public async Task RemoveAsync(string id) =>
            await _usersCollection.DeleteOneAsync(x => x.Id == id);
    }
}
