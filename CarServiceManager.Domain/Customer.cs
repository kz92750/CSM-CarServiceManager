namespace CarServiceManager.Domain;

public class Customer
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public string PhoneNumber { get; private set; }
    public string Email { get; private set; }
    private readonly List<Car> _cars = new List<Car>();
    public IReadOnlyCollection<Car> Cars => _cars.AsReadOnly();

    public Customer(string firstName, string lastName, string phoneNumber, string email)
    {
        if (string.IsNullOrWhiteSpace(firstName))
        {
            throw new ArgumentException("Imię nie może być puste", nameof(firstName));
        }

        if (string.IsNullOrWhiteSpace(lastName))
        {
            throw new ArgumentException("Nazwa nie może być pusta", nameof(lastName));
        }

        if (string.IsNullOrWhiteSpace(phoneNumber))
        {
            throw new ArgumentException("Numer telefonu nie może być pusty", nameof(phoneNumber));
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ArgumentException("Email nie może być pusty", nameof(email));
        }

        FirstName = firstName;
        LastName = lastName;
        this.PhoneNumber = phoneNumber;
        this.Email = email;
    }

    public void AddCar(Car car)
    {
        if (car == null)
        {
            throw new ArgumentNullException(nameof(Car), "Samochód nie może być pusty");
        }

        _cars.Add(car);
    }
}