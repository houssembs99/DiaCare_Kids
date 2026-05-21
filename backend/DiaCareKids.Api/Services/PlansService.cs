using DiaCareKids.Api.Models;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DiaCareKids.Api.Services
{
    public class PlansService
    {
        private readonly IMongoCollection<SubscriptionPlan> _plansCollection;

        public PlansService(IMongoDatabase database)
        {
            _plansCollection = database.GetCollection<SubscriptionPlan>("SubscriptionPlans");
        }

        public async Task<List<SubscriptionPlan>> GetAsync() =>
            await _plansCollection.Find(_ => true).ToListAsync();

        public async Task<SubscriptionPlan?> GetAsync(string id) =>
            await _plansCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task<SubscriptionPlan?> GetByNameAndRoleAsync(string name, string role) =>
            await _plansCollection.Find(x => x.Name.ToLower() == name.ToLower() && x.Role.ToLower() == role.ToLower()).FirstOrDefaultAsync();

        public async Task CreateAsync(SubscriptionPlan newPlan) =>
            await _plansCollection.InsertOneAsync(newPlan);

        public async Task UpdateAsync(string id, SubscriptionPlan updatedPlan) =>
            await _plansCollection.ReplaceOneAsync(x => x.Id == id, updatedPlan);

        public async Task RemoveAsync(string id) =>
            await _plansCollection.DeleteOneAsync(x => x.Id == id);

        public async Task SeedAsync()
        {
            var count = await _plansCollection.CountDocumentsAsync(_ => true);
            if (count == 0)
            {
                var seedPlans = new List<SubscriptionPlan>
                {
                    // Clinique Plans
                    new SubscriptionPlan
                    {
                        Name = "Basic",
                        Price = 49,
                        Currency = "dt",
                        Duration = "Mensuel",
                        Role = "Clinique",
                        MaxDoctors = 2,
                        MaxPatients = 50,
                        Features = new List<string> { "Gestion des patients", "Journal de bord", "Support Email" },
                        Color = "from-slate-400 to-slate-600",
                        IconName = "Shield",
                        IsPopular = false
                    },
                    new SubscriptionPlan
                    {
                        Name = "Pro",
                        Price = 149,
                        Currency = "dt",
                        Duration = "Mensuel",
                        Role = "Clinique",
                        MaxDoctors = 10,
                        MaxPatients = 500,
                        Features = new List<string> { "Analyse IA Basique", "Multi-Clinique", "Rapports PDF", "Support 24/7" },
                        Color = "from-[#1E88E5] to-[#1565C0]",
                        IconName = "Star",
                        IsPopular = true
                    },
                    new SubscriptionPlan
                    {
                        Name = "Premium",
                        Price = 299,
                        Currency = "dt",
                        Duration = "Mensuel",
                        Role = "Clinique",
                        MaxDoctors = 50,
                        MaxPatients = -1, // Unlimited
                        Features = new List<string> { "DiaPote IA Expert", "Réalité Augmentée", "Statistiques Avancées", "API Dédiée" },
                        Color = "from-yellow-500 to-orange-600",
                        IconName = "Crown",
                        IsPopular = false
                    },

                    // Parent Plans
                    new SubscriptionPlan
                    {
                        Name = "Solo",
                        Price = 9.99,
                        Currency = "dt",
                        Duration = "Mensuel",
                        Role = "Parent",
                        MaxKids = 1,
                        Features = new List<string> { "Suivi de 1 enfant", "Alertes médicales", "Accès aux dossiers", "Jeux éducatifs AR" },
                        Color = "from-emerald-400 to-emerald-600",
                        IconName = "Shield",
                        IsPopular = false
                    },
                    new SubscriptionPlan
                    {
                        Name = "Duo",
                        Price = 19.99,
                        Currency = "dt",
                        Duration = "Mensuel",
                        Role = "Parent",
                        MaxKids = 2,
                        Features = new List<string> { "Suivi de 2 enfants", "Alertes médicales", "Accès aux dossiers", "Jeux éducatifs AR", "Support 24/7" },
                        Color = "from-indigo-400 to-indigo-600",
                        IconName = "Star",
                        IsPopular = true
                    },
                    new SubscriptionPlan
                    {
                        Name = "Famille",
                        Price = 29.99,
                        Currency = "dt",
                        Duration = "Mensuel",
                        Role = "Parent",
                        MaxKids = 3,
                        Features = new List<string> { "Suivi jusqu'à 3 enfants", "Alertes médicales", "Accès aux dossiers", "Jeux éducatifs AR", "Support 24/7", "Analyses avancées" },
                        Color = "from-pink-400 to-pink-600",
                        IconName = "Crown",
                        IsPopular = false
                    },
                    new SubscriptionPlan
                    {
                        Name = "Sous Clinique",
                        Price = 0,
                        Currency = "dt",
                        Duration = "Mensuel",
                        Role = "Parent",
                        MaxKids = 3, // Consumes quota of the clinic
                        Features = new List<string> { "Gratuit via Clinique", "Rattaché au forfait Clinique", "Suivi partagé", "Jeux éducatifs AR" },
                        Color = "from-purple-400 to-purple-600",
                        IconName = "Shield",
                        IsPopular = false
                    }
                };

                await _plansCollection.InsertManyAsync(seedPlans);
            }
        }
    }
}
