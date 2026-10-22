using Xunit;
using FluentAssertions;
using NSubstitute;
using CarServiceManager.App.Abstractions;
using CarServiceManager.App.Services;
using CarServiceManager.Domain;

namespace CarServiceManager.UnitTests.Services;

public class ServiceVisitServiceTests
{
    [Fact]
    public async Task CreateAsync_WhenCarDoesNotExist_ShouldThrowInvalidOperationException()
    {
        // 1. Arrange 
        var visitRepo = Substitute.For<IServiceVisitRepository>();
        var carRepo = Substitute.For<ICarRepository>();

        var nonExistingCarId = Guid.NewGuid();
        
        carRepo.CarExistsAsync(nonExistingCarId).Returns(false);
        
        var service = new ServiceVisitService(visitRepo, carRepo);

        // 2. Act 
        Func<Task> act = async () => await service.CreateAsync(
            nonExistingCarId, 
            DateTime.Now.AddDays(1), 
            "Wymiana oleju", 
            300m
        );

        // 3. Assert 
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage($"Samochód o tym ID {nonExistingCarId} nie istnieje.*");
    }
    [Fact]
    public async Task CreateAsync_WhenCarExists_ShouldCreateVisitAndSaveToDatabase()
    {
        // Arrange
        var visitRepo = Substitute.For<IServiceVisitRepository>();
        var carRepo = Substitute.For<ICarRepository>();

        var carId = Guid.NewGuid();
    
        carRepo.CarExistsAsync(carId).Returns(true);

        var service = new ServiceVisitService(visitRepo, carRepo);

        // Act
        var result = await service.CreateAsync(carId, DateTime.Now.AddDays(1), "Wymiana klocków", 450m);

        // Assert
        result.Should().NotBeNull();
        result.CarId.Should().Be(carId);
        result.Status.Should().Be(VisitStatus.Planned);
        
        await visitRepo.Received(1).AddAsync(Arg.Any<ServiceVisit>());
        await visitRepo.Received(1).SaveChangesAsync();
    }
}