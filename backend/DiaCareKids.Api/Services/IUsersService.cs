using DiaCareKids.Api.Models;

namespace DiaCareKids.Api.Services
{
    public interface IUsersService
    {
        Task<List<User>> GetAsync();
        Task<List<User>> GetByRoleAsync(string role);
        Task<User?> GetAsync(string id);
        Task<User?> GetByEmailAsync(string email);
        Task<List<User>> GetByParentIdAsync(string parentId);
        Task<List<User>> GetByClinicIdAsync(string clinicId);
        Task<List<User>> GetByDoctorIdAsync(string doctorId);
        Task<User?> GetByFileNumberAsync(string fileNumber);
        Task CreateAsync(User newUser);
        Task UpdateAsync(string id, User updatedUser);
        Task RemoveAsync(string id);
    }
}
