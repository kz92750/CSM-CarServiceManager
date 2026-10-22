using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using CarServiceManager.Domain;

namespace CarServiceManager.Infrastructure.Persistence;

public class AppDbContext : IdentityDbContext
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
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ServiceVisit>()
            .Property(v => v.RequestedCost)
            .HasPrecision(18, 2);
    }
}