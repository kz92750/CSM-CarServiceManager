namespace CarServiceManager.Domain;

public class ServiceVisit
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid CarId { get; private set; }
    public DateTime VisitDate { get; private set; }
    public string Description { get; private set; }
    public VisitStatus Status { get; private set; }
    
    public decimal RequestedCost { get; private set; }
    
    public ServiceVisit(Guid carId, DateTime visitDate, string description, decimal requestedCost)
    {
        
        if (requestedCost < 0)
        {
            throw new ArgumentException("Koszt wizyty nie może być ujemny", nameof(requestedCost));
        }
        
        if (string.IsNullOrEmpty(description))
        {
            throw new ArgumentException("Opis wizyty nie może być pusty", nameof(description));
        }
        CarId = carId;
        VisitDate = visitDate;
        Description = description;
        Status = VisitStatus.Planned;
        RequestedCost = requestedCost;
    }
    
    public void Start()
    {
        if (Status != VisitStatus.Planned)
        {
            throw new InvalidOperationException("Nie można uruchomić wizyty, która nie jest zaplanowana");
        }
        Status = VisitStatus.InProgress;
    }
    
    public void Complete()
    {
        if (Status != VisitStatus.InProgress)
        {
            throw new InvalidOperationException("Nie można zakończyć wizyty, która nie jest w trakcie realizacji");
        }
        Status = VisitStatus.Completed;
    }
    
    public void Cancel()
    {
        if (Status == VisitStatus.Cancelled)
        {
            throw new InvalidOperationException("Wizyta jest już anulowana");
        }
        if (Status == VisitStatus.Completed)
        {
            throw new InvalidOperationException("Nie można anulować wizyty, która została zakończona");
        }
        Status = VisitStatus.Cancelled;
    }
    
}