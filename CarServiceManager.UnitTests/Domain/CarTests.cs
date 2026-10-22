using FluentAssertions;
using CarServiceManager.Domain;
namespace CarServiceManager.UnitTests.Domain;
public class CarTests
{
    [Fact]
    public void UpdateMilage_ShouldUpdateMileage_WhenNewMileageIsLessThanCurrentMileage()
    {
       //Arrange 
        var car = new Car(Guid.NewGuid(), "Toyota", "Camry","JTDBR32E720123456" ,17000, "KR12345");
        var newMileage = 15000;

        //Act
        Action act = () => car.UpdateMileage(newMileage);

        //Assert
        act.Should().Throw<ArgumentException>()
            .WithMessage("Nowy przebieg nie może być mniejszy niż aktualny przebieg*");
    }
    [Fact]
    public void UpdateMilage_ShouldUpdateMileage_WhenNewMileageIsGreaterThanCurrentMileage()
    {
        //Arrange 
        var car = new Car(Guid.NewGuid(), "Toyota", "Camry","JTDBR32E720123456" ,17000, "KR12345");
        var newMileage = 20000;

        //Act
        car.UpdateMileage(newMileage);

        //Assert
        car.Mileage.Should().Be(newMileage);
    }
}