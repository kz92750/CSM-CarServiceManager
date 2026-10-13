namespace CarServiceManager.Domain;
using System.Linq;
using System.Xml.Schema;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("Witaj w aplikacji CarServiceManager!");
        Car car = new Car(customerId: Guid.NewGuid(), make: "Toyota", model: "Corolla", vin: "JTDBR32E720123456", mileage: 40000, licensePlate: "ABC123");
        car.UpdateMileage(45000);
        try
        {
            car.UpdateMileage(55000);
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
        }

        Console.WriteLine(
            $"Samochód: {car.Make} {car.Model}, VIN: {car.Vin}, Przebieg: {car.Mileage}, Rejestracja: {car.LicensePlate}");
        Customer customer = new Customer("Jan", "Kowalski", "123456789", "jan.kowalski@example.com");
        customer.AddCar(new Car(customerId: Guid.NewGuid(), make: "Toyota", model: "Corolla", vin: "JTDBR32E720123456", mileage: 50000, licensePlate: "ABC123"));
        customer.AddCar(new Car(customerId: Guid.NewGuid(), make: "Toyota", model: "Yaris", vin: "1FAHP3F26CL123456", mileage: 20000, licensePlate: "DEF456"));
        customer.AddCar(new Car(customerId: Guid.NewGuid(), make: "Honda", model: "Civic", vin: "2HGFG3B59FH123456", mileage: 120000, licensePlate: "XYZ789"));
        customer.Cars.Where(c => c.Make == "Toyota").ToList().ForEach(c =>
            Console.WriteLine(
                $"Samochód: {c.Make} {c.Model}, VIN: {c.Vin}, Przebieg: {c.Mileage}, Rejestracja: {c.LicensePlate}"));
        Console.WriteLine($"Łączny przebieg: {customer.Cars.Sum(c => c.Mileage)}");
    }
}