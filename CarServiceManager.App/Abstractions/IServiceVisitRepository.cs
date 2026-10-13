using CarServiceManager.Domain;

namespace CarServiceManager.App.Abstractions;

public interface IServiceVisitRepository
{
    Task<ServiceVisit?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);

    public Task AddAsync(ServiceVisit visit, CancellationToken cancellationToken = default);
}