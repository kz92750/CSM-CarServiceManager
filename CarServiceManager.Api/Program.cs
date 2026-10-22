using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CarServiceManager.App.Abstractions;
using CarServiceManager.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using CarServiceManager.Domain;
using CarServiceManager.App.Services;
using FluentValidation;
using CarServiceManager.Api.Validators;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IServiceVisitRepository, ServiceVisitRepository>();
builder.Services.AddScoped<ServiceVisitService>();
builder.Services.AddScoped<ICarRepository, CarRepository>();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => 
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddValidatorsFromAssemblyContaining<Program>();

builder.Services.AddIdentityCore<IdentityUser>(options =>
    {
        options.Password.RequireDigit = false;
        options.Password.RequireLowercase = false;
        options.Password.RequireUppercase = false;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequiredLength = 6;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>();

var jwtKey = builder.Configuration["Jwt:Key"] ?? "CarServiceManagerSuperSecretSecretKey2026!MustBe32BytesLong";
builder.Services.AddAuthentication(Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "CarServiceManagerApi",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "CarServiceManagerClient",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();
var app = builder.Build();
app.UseCors();
app.UseAuthentication(); 
app.UseAuthorization();  

//New User
app.MapPost("/api/auth/register", async (
    RegisterRequest request, 
    UserManager<IdentityUser> userManager, 
    RoleManager<IdentityRole> roleManager) =>
{
    if (!await roleManager.RoleExistsAsync(request.Role))
    {
        await roleManager.CreateAsync(new IdentityRole(request.Role));
    }

    var user = new IdentityUser { UserName = request.Email, Email = request.Email };
    var result = await userManager.CreateAsync(user, request.Password);

    if (!result.Succeeded)
    {
        return Results.BadRequest(result.Errors.Select(e => e.Description));
    }
    
    //Role
    await userManager.AddToRoleAsync(user, request.Role);

    return Results.Ok(new { message = $"Użytkownik {request.Email} zarejestrowany z rolą {request.Role}!" });
});

// Login and generate JWT token
app.MapPost("/api/auth/login", async (
    LoginRequest request, 
    UserManager<IdentityUser> userManager, 
    IConfiguration config) =>
{
    var user = await userManager.FindByEmailAsync(request.Email);
    if (user == null || !await userManager.CheckPasswordAsync(user, request.Password))
    {
        return Results.Unauthorized();
    }

    var roles = await userManager.GetRolesAsync(user);
    var userRole = roles.FirstOrDefault() ?? "Customer";

    // Create claims for the JWT token
    var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id),
        new Claim(ClaimTypes.Email, user.Email!),
        new Claim(ClaimTypes.Role, userRole)
    };

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    // 7 days expiration
    var token = new JwtSecurityToken(
        issuer: config["Jwt:Issuer"],
        audience: config["Jwt:Audience"],
        claims: claims,
        expires: DateTime.UtcNow.AddDays(7),
        signingCredentials: creds
    );

    var jwtString = new JwtSecurityTokenHandler().WriteToken(token);

    return Results.Ok(new
    {
        token = jwtString,
        email = user.Email,
        role = userRole
    });
});

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

app.MapPost("/api/customers", async (
    CreateCustomerRequest req, 
    IValidator<CreateCustomerRequest> validator, 
    AppDbContext dbContext) =>
{
    var validationResult = await validator.ValidateAsync(req);
    if (!validationResult.IsValid)
    {
        return Results.ValidationProblem(validationResult.ToDictionary());
    }

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

app.MapPost("/api/cars", async (
    CreateCarRequest request, 
    IValidator<CreateCarRequest> validator, 
    AppDbContext dbContext) =>
{
    var validationResult = await validator.ValidateAsync(request);
    if (!validationResult.IsValid)
    {
        return Results.ValidationProblem(validationResult.ToDictionary());
    }

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
app.MapPost("/api/service-visits", async (CreateServiceVisitRequest request, ServiceVisitService serviceVisitService) =>
{
    try
    {
        var serviceVisit = await serviceVisitService.CreateAsync(
            request.CarId,
            request.VisitDate,
            request.Description,
            request.RequestedCost
        );
        return Results.Created($"/api/service-visits/{serviceVisit.Id}", serviceVisit);
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(ex.Message);
    }

});

app.MapGet("/api/service-visits", async (AppDbContext dbContext) =>
{
    var serviceVisits = await dbContext.ServiceVisits.ToListAsync();
    return Results.Ok(serviceVisits);
});

app.MapGet("/api/cars/{carId:guid}/service-visits", async (Guid carId, AppDbContext dbContext) =>
{
    var serviceVisits = await dbContext.ServiceVisits.Where(sv => sv.CarId == carId).ToListAsync();
    return Results.Ok(serviceVisits);
});

app.MapPost("/api/service-visits/{id:guid}/start", async (
        Guid id, 
        ServiceVisitService serviceVisitService) =>
    {
        try
        {
            var serviceVisit = await serviceVisitService.StartAsync(id);
            return Results.Ok(serviceVisit);
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(ex.Message);
        }
    })
    .RequireAuthorization();

app.MapPost("/api/service-visits/{id:guid}/complete", async (Guid id, ServiceVisitService serviceVisitService) =>
{
    try
    {
        var serviceVisit = await serviceVisitService.CompleteAsync(id);
        return Results.Ok(serviceVisit);
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(ex.Message);
    }
});

    app.MapPost("/api/service-visits/{id:guid}/cancel", async (Guid id, ServiceVisitService serviceVisitService) =>
    {
        try
        {
            var serviceVisit = await serviceVisitService.CancelAsync(id);
            return Results.Ok(serviceVisit);
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(ex.Message);
        }
    });

    app.MapGet("/api/dashboard/stats", async (AppDbContext dbContext) =>
    {
        var totalCustomers = await dbContext.Customers.CountAsync();
        var totalCars = await dbContext.Cars.CountAsync();
       
        var activeVisits = await dbContext.ServiceVisits.CountAsync(v => 
            v.Status == VisitStatus.Planned || v.Status == VisitStatus.InProgress);
      
        var totalRevenue = await dbContext.ServiceVisits
            .Where(v => v.Status == VisitStatus.Completed)
            .SumAsync(v => (decimal?)v.RequestedCost) ?? 0m;

        return Results.Ok(new
        {
            TotalCustomers = totalCustomers,
            TotalCars = totalCars,
            ActiveVisits = activeVisits,
            TotalRevenue = totalRevenue
        });
    });



app.Run();

public record CreateCarRequest(Guid CustomerId, string Make, string Model, string Vin, int Mileage, string LicensePlate);
public record CreateCustomerRequest(string FirstName, string LastName, string PhoneNumber, string Email); 
public record CreateServiceVisitRequest(Guid CarId, DateTime VisitDate, string Description, decimal RequestedCost);
public record RegisterRequest(string Email, string Password, string Role);
public record LoginRequest(string Email, string Password);

