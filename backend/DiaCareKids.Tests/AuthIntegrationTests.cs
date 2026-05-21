using System.Net.Http.Json;
using System.Net;
using Xunit;
using DiaCareKids.Api.Controllers;

namespace DiaCareKids.Tests
{
    public class AuthIntegrationTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public AuthIntegrationTests(CustomWebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task RegisterAndLogin_ShouldSucceed()
        {
            // Arrange
            var uniqueEmail = $"testuser_{Guid.NewGuid()}@example.com";
            var testUser = new RegisterRequest
            {
                Email = uniqueEmail,
                Password = "Password123!",
                FullName = "Integration Test User",
                Role = "Parent",
                SubscriptionPlan = "Solo"
            };

            // Act - Register
            var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", testUser);
            
            // Assert - Register
            Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);

            // Act - Login
            var loginRequest = new LoginRequest
            {
                Email = uniqueEmail,
                Password = "Password123!"
            };
            var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

            // Assert - Login
            Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
            var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
            Assert.NotNull(loginResult?.Token);
            Assert.Equal(testUser.FullName, loginResult?.FullName);
        }

        // Helper class for deserialization
        public class LoginResponse
        {
            public string? Token { get; set; }
            public string? Role { get; set; }
            public string? FullName { get; set; }
            public string? Id { get; set; }
        }
    }
}
