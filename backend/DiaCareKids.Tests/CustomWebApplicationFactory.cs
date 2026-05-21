using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;

namespace DiaCareKids.Tests
{
    public class CustomWebApplicationFactory<TProgram> : WebApplicationFactory<TProgram> where TProgram : class
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureAppConfiguration((context, config) =>
            {
                // Override database for testing
                var testConfig = new Dictionary<string, string?>
                {
                    {"MongoDbSettings:DatabaseName", "DiaCareKidsDb_Test"}
                };
                config.AddInMemoryCollection(testConfig);
            });

            builder.ConfigureServices(services =>
            {
                // You can swap services here if needed (e.g., mock email service)
            });
        }
    }
}
