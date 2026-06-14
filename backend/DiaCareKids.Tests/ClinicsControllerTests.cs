using DiaCareKids.Api.Controllers;
using DiaCareKids.Api.Models;
using DiaCareKids.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace DiaCareKids.Tests
{
    public class ClinicsControllerTests
    {
        private readonly Mock<IUsersService> _mockUsersService;
        private readonly ClinicsController _controller;

        public ClinicsControllerTests()
        {
            _mockUsersService = new Mock<IUsersService>();
            _controller = new ClinicsController(_mockUsersService.Object);
        }

        [Fact]
        public async Task Get_ReturnsOnlyActiveClinicsWithActiveSubscription()
        {
            // Arrange
            var clinics = new List<User>
            {
                new User { Id = "1", Status = "Actif", Role = "Clinique", Subscription = new SubscriptionDetails { IsActive = true } },
                new User { Id = "2", Status = "Inactif", Role = "Clinique", Subscription = new SubscriptionDetails { IsActive = true } },
                new User { Id = "3", Status = "Actif", Role = "Clinique", Subscription = new SubscriptionDetails { IsActive = false } },
                new User { Id = "4", Status = "Actif", Role = "Clinique", Subscription = null }
            };

            _mockUsersService.Setup(s => s.GetAsync()).ReturnsAsync(clinics);

            // Act
            var result = await _controller.Get();

            // Assert
            Assert.Single(result);
            Assert.Equal("1", result[0].Id);
        }

        [Fact]
        public async Task GetById_ReturnsNotFound_WhenClinicDoesNotExist()
        {
            // Arrange
            _mockUsersService.Setup(s => s.GetAsync("999")).ReturnsAsync((User?)null);

            // Act
            var result = await _controller.Get("999");

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }
    }
}
