using CarServiceManager.App.Abstractions;
using CarServiceManager.Domain;
namespace CarServiceManager.Infrastructure.Persistence;

public class ServiceVisitRepository : IServiceVisitRepository
{
    private readonly AppDbContext _context;

    public ServiceVisitRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceVisit?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.ServiceVisits.FindAsync(new object[] { id }, cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(cancellationToken);
    }

    public Task AddAsync(ServiceVisit visit, CancellationToken cancellationToken = default)
    {
        _context.ServiceVisits.Add(visit);
        return Task.CompletedTask;
    }
}