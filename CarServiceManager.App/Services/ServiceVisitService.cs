using CarServiceManager.App.Abstractions;
using CarServiceManager.Domain;

namespace CarServiceManager.App.Services;

public class ServiceVisitService 
{
    private readonly IServiceVisitRepository _repository;
    private readonly ICarRepository _car;
    
    public ServiceVisitService(IServiceVisitRepository repository, ICarRepository car)
    {
        _repository = repository;
        _car = car;
    }
    public async Task<ServiceVisit> StartAsync(Guid visitId, CancellationToken cancellationToken = default)
    {
        var visit = await _repository.GetByIdAsync(visitId, cancellationToken);
        if (visit == null)
        {
            throw new InvalidOperationException($"Wizyty o tym ID  {visitId} nie znaleziono.");
        }
        visit.Start();
        await _repository.SaveChangesAsync(cancellationToken);
        return visit;
        
    }
    
    public async Task<ServiceVisit> CompleteAsync(Guid visitId, CancellationToken cancellationToken = default)
    {
        var visit = await _repository.GetByIdAsync(visitId, cancellationToken);
        if (visit == null)
        {
            throw new InvalidOperationException($"Wizyty o tym ID  {visitId} nie znaleziono.");
        }
        visit.Complete();
        await _repository.SaveChangesAsync(cancellationToken);
        return visit;
    }
    
    public async Task<ServiceVisit> CancelAsync(Guid visitId, CancellationToken cancellationToken = default)
    {
        var visit = await _repository.GetByIdAsync(visitId, cancellationToken);
        if (visit == null)
        {
            throw new InvalidOperationException($"Wizyty o tym ID  {visitId} nie znaleziono.");
        }
        visit.Cancel();
        await _repository.SaveChangesAsync(cancellationToken);
        return visit;
    }
    
    public async Task<ServiceVisit> CreateAsync(Guid carId, DateTime visitDate, string description, decimal requestedCost, CancellationToken cancellationToken = default)
    {
        
        if (!await _car.CarExistsAsync(carId, cancellationToken))
        {
            throw new InvalidOperationException($"Samochód o tym ID {carId} nie istnieje.");
        }
        var visit = new ServiceVisit(carId, visitDate, description, requestedCost); 
        await _repository.AddAsync(visit, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return visit;
    }
    
}