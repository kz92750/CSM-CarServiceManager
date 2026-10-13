namespace CarServiceManager.App.Abstractions;

public interface ICarRepository
{
    Task<bool> CarExistsAsync(Guid carId, CancellationToken cancellationToken = default);
}