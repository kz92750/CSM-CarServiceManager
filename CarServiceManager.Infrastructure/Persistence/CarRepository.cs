using CarServiceManager.App.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace CarServiceManager.Infrastructure.Persistence;

public class CarRepository : ICarRepository
{
    private readonly AppDbContext _context;
    
    public CarRepository(AppDbContext context)
    {
        _context = context;
    }
    
    public Task<bool> CarExistsAsync(Guid carId, CancellationToken cancellationToken = default)
    {
        return _context.Cars.AnyAsync(c => c.Id == carId, cancellationToken);
    }
}