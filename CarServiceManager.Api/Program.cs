using CarServiceManager.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using CarServiceManager.Domain;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

//app.UseHttpsRedirection();



app.MapGet("/api/cars", async (AppDbContext dbContext) =>
{
    var cars = await dbContext.Cars.ToListAsync();
    return Results.Ok(cars);
});

app.MapGet("/api/cars/{id:guid}", async (Guid id, AppDbContext dbContext) =>
{
    var car = await dbContext.Cars.FindAsync(id);
    if (car == null)
    {
        return Results.NotFound();
    }
    return Results.Ok(car);
});

app.MapPost("/api/customers", async (CreateCustomerRequest req, AppDbContext dbContext) =>
{
    try
    {
        var customer = new Customer(
            req.FirstName,
            req.LastName,
            req.PhoneNumber,
            req.Email
        );
        dbContext.Customers.Add(customer);
        await dbContext.SaveChangesAsync();
        return Results.Created($"/api/customers/{customer.Id}", customer);
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(ex.Message);
    }
});

app.MapGet("/api/customers", async (AppDbContext dbContext) =>
{
    var customers = await dbContext.Customers.ToListAsync();
    return Results.Ok(customers);
});

app.MapGet("/api/customers/{customerId:guid}/cars", async (Guid customerId, AppDbContext dbContext) =>
{
    var cars = await dbContext.Cars.Where(c => c.CustomerId == customerId).ToListAsync();
    return Results.Ok(cars);
});

app.MapPost("/api/cars", async (CreateCarRequest request, AppDbContext dbContext) =>
{
    try
    {
        var customerExists = await dbContext.Customers.AnyAsync(c => c.Id == request.CustomerId);
        if (!customerExists)
        {
            return Results.BadRequest("Customer not found");
        }

        var car = new Car(
            request.CustomerId,
            request.Make,
            request.Model,
            request.Vin,
            request.Mileage,
            request.LicensePlate
        );
        dbContext.Cars.Add(car);
        await dbContext.SaveChangesAsync();
        return Results.Created($"/api/cars/{car.Id}", car);
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(ex.Message);
    }
    
});
app.MapPost("/api/service-Visits", async (CreateServiceVisitRequest request, AppDbContext dbContext) =>
{
    try
    {
        var carExists = await dbContext.Cars.AnyAsync(c => c.Id == request.CarId);
        if (!carExists)
        {
            return Results.BadRequest("Car not found");
        }

       var serviceVisit = new ServiceVisit(
            request.CarId,
            request.VisitDate,
            request.Description
        );
        dbContext.ServiceVisits.Add(serviceVisit);
        await dbContext.SaveChangesAsync();
        return Results.Created($"/api/service-visits/{serviceVisit.Id}", serviceVisit);
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(ex.Message);
    }

});


app.Run();

public record CreateCarRequest(Guid CustomerId, string Make, string Model, string Vin, int Mileage, string LicensePlate);
public record CreateCustomerRequest(string FirstName, string LastName, string PhoneNumber, string Email); 
public record CreateServiceVisitRequest(Guid CarId, DateTime VisitDate, string Description);

