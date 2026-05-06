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

builder.Services.AddScoped<DiaCareKids.Api.Services.UsersService>();
builder.Services.AddScoped<DiaCareKids.Api.Services.PatientsService>();
builder.Services.AddScoped<DiaCareKids.Api.Services.MedicalRecordsService>();
builder.Services.AddScoped<DiaCareKids.Api.Services.ClinicsService>();
builder.Services.AddScoped<DiaCareKids.Api.Services.DoctorsService>();
builder.Services.AddScoped<DiaCareKids.Api.Services.MessagesService>();
builder.Services.AddSingleton<DiaCareKids.Api.Services.DecisionSupportService>();
builder.Services.AddSingleton<DiaCareKids.Api.Services.GlucosePredictionService>();
builder.Services.AddScoped<IPhotoService, PhotoService>();
builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));



// Auth Configuration
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secret = jwtSettings.GetValue<string>("Secret") ?? "default_secret_key_change_me_123456789";

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
        ValidIssuer = jwtSettings.GetValue<string>("Issuer"),
        ValidAudience = jwtSettings.GetValue<string>("Audience"),
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

app.Run();
