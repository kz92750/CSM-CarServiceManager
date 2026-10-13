namespace CarServiceManager.Domain;
public class Car
{
    public Guid CustomerId { get; private set; }
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Make { get; private set; }
    public string Model { get; private set; }
    public string Vin { get; private set; }
    public int Mileage { get; private set; }
    public string LicensePlate { get; private set; }
    
    public Car (Guid customerId, string make, string model, string vin, int mileage, string licensePlate)
    {
        if (customerId == Guid.Empty)
        {
            throw new ArgumentException("ID klienta nie może być puste", nameof(customerId));
        }
        CustomerId = customerId;
        Make = make;
        Model = model;
        if (string.IsNullOrEmpty(vin) || vin.Length != 17)
        {
            throw new ArgumentException("VIN nie może być pusty lub musi mieć 17 znaków", nameof(vin));
        }
        Vin = vin;
        if (mileage < 0)
        {
            throw new ArgumentException("Przebieg nie może być ujemny", nameof(mileage));
        }
        Mileage = mileage;
        LicensePlate = licensePlate;
    }
    public void UpdateMileage(int newMileage)
    {
        if (newMileage < Mileage)
        {
            throw new ArgumentException("Nowy przebieg nie może być mniejszy niż aktualny przebieg", nameof(newMileage));
        }
        Mileage = newMileage;
    }
}