using Microsoft.EntityFrameworkCore;
using CarServiceManager.Domain;
using Microsoft.EntityFrameworkCore.Design;

namespace CarServiceManager.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }
    public DbSet<Car> Cars => Set<Car>();
    public DbSet<Customer> Customers => Set<Customer>();
    
    public DbSet<ServiceVisit> ServiceVisits => Set<ServiceVisit>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ServiceVisit>()
            .Property(v => v.RequestedCost)
            .HasPrecision(18, 2);
    }
}