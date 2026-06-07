using System.Text;
using DiaCareKids.Api.Configuration;
using DiaCareKids.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// MongoDB Configuration
var mongoDbSettings = builder.Configuration.GetSection("MongoDbSettings").Get<MongoDbSettings>();
builder.Services.AddSingleton<IMongoClient>(s => 
    new MongoClient(mongoDbSettings?.ConnectionString ?? "mongodb://localhost:27017"));

builder.Services.AddScoped(s => 
{
    var client = s.GetRequiredService<IMongoClient>();
    return client.GetDatabase(mongoDbSettings?.DatabaseName ?? "DiaCareKidsDb");
});

builder.Services.AddScoped<UsersService>();
builder.Services.AddScoped<DiaCareKids.Api.Services.PlansService>();
builder.Services.AddScoped<DiaCareKids.Api.Services.PatientsService>();
builder.Services.AddScoped<DiaCareKids.Api.Services.MedicalRecordsService>();
builder.Services.AddScoped<DiaCareKids.Api.Services.ClinicsService>();
builder.Services.AddScoped<DiaCareKids.Api.Services.DoctorsService>();
builder.Services.AddScoped<DiaCareKids.Api.Services.MessagesService>();
builder.Services.AddScoped<DiaCareKids.Api.Services.TransactionsService>();
builder.Services.AddScoped<DiaCareKids.Api.Services.ClinicPackagesService>();
builder.Services.AddSingleton<DiaCareKids.Api.Services.DecisionSupportService>();
builder.Services.AddSingleton<DiaCareKids.Api.Services.GlucosePredictionService>();
builder.Services.AddScoped<IPhotoService, PhotoService>();
builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));

// Stripe Configuration
builder.Services.Configure<StripeSettings>(builder.Configuration.GetSection("StripeSettings"));
builder.Services.AddScoped<StripeService>();

// Auth Configuration
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secret = jwtSettings.GetValue<string>("Secret") ?? "default_secret_key_change_me_123456789";
var issuer = jwtSettings.GetValue<string>("Issuer") ?? "DiaCareKids";
var audience = jwtSettings.GetValue<string>("Audience") ?? "DiaCareKidsUsers";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret))
    };
});

builder.Services.AddAuthorization();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DictionaryKeyPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// CORS for React Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder => builder.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseStaticFiles(); // Serve /wwwroot/uploads

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// SEED DATA: Create a test doctor if database is empty or user not found
using (var scope = app.Services.CreateScope())
{
    var plansService = scope.ServiceProvider.GetRequiredService<DiaCareKids.Api.Services.PlansService>();
    await plansService.SeedAsync();

    var usersService = scope.ServiceProvider.GetRequiredService<UsersService>();
    var testEmail = "medecin@gmail.com";
    var existing = await usersService.GetByEmailAsync(testEmail);
    if (existing == null)
    {
        Console.WriteLine($"[SEED] Creating test doctor: {testEmail}");
        await usersService.CreateAsync(new DiaCareKids.Api.Models.User
        {
            Email = testEmail,
            FullName = "Dr. Ahmed Amor",
            Role = "Medecin",
            Status = "Actif",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Medecin123!"),
            ClinicType = "Endocrinologue Pédiatre",
            ContactNumber = "+216 22 123 456",
            FileNumber = "9201-TU-2024",
            CreatedAt = DateTime.UtcNow
        });
    }
}

app.Run();

public partial class Program { }
