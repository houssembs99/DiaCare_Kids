using DiaCareKids.Api.Models;
using MongoDB.Driver;

namespace DiaCareKids.Api.Services
{
    public class LogsService
    {
        private readonly IMongoCollection<SystemLog> _logs;

        public LogsService(IMongoDatabase database)
        {
            _logs = database.GetCollection<SystemLog>("SystemLogs");
        }

        public async Task<List<SystemLog>> GetAllAsync()
        {
            return await _logs.Find(_ => true).SortByDescending(l => l.Date).ToListAsync();
        }

        public async Task CreateAsync(SystemLog log)
        {
            await _logs.InsertOneAsync(log);
        }

        public async Task SeedAsync()
        {
            var count = await _logs.CountDocumentsAsync(_ => true);
            if (count == 0)
            {
                var initialLogs = new List<SystemLog>
                {
                    new SystemLog { Action = "Tentative de connexion échouée", User = "Inconnu", Type = "Danger", Date = DateTime.UtcNow.AddMinutes(-30), Device = "API" },
                    new SystemLog { Action = "Blocage compte suspect", User = "System", Type = "Urgent", Date = DateTime.UtcNow.AddHours(-1), Device = "Antivirus API" },
                    new SystemLog { Action = "Mise à jour SSL", User = "System", Type = "Info", Date = DateTime.UtcNow.AddDays(-1), Device = "Cloudflare" },
                    new SystemLog { Action = "Suppression Clinique", User = "Admin (Houssem)", Type = "Sensible", Date = DateTime.UtcNow.AddHours(-2), Device = "Safari / macOS" },
                    new SystemLog { Action = "Export Base de Données", User = "Admin (Houssem)", Type = "Sensible", Date = DateTime.UtcNow.AddHours(-14), Device = "Chrome / Windows" }
                };
                await _logs.InsertManyAsync(initialLogs);
            }
        }
    }
}
