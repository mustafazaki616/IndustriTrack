using Microsoft.EntityFrameworkCore;
using backend.Data;

var builder = WebApplication.CreateBuilder(args);

// Configure port for Railway deployment
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://*:{port}");

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Entity Framework Core with SQLite
builder.Services.AddDbContext<IndustriTrackContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000", // Local development
                "http://localhost:3001", // Local development alternate port
                "https://industri-track-frontend.vercel.app", // Main Vercel production URL
                "https://industri-track-frontend-c9aa8o08b-zakis-projects-a97e61f1.vercel.app", // Old Vercel deployment
                "https://industri-track-frontend-82mp5hi7e-zakis-projects-a97e61f1.vercel.app" // Latest Vercel deployment
              )
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Initialize and seed the database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<IndustriTrackContext>();
    context.Database.EnsureCreated();
    await DbSeeder.SeedData(context);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Enable CORS for both development and production
app.UseCors("AllowFrontend");

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// Add health check endpoint for Railway
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

// Add simple test endpoint
app.MapGet("/", () => "IndustriTrack Backend is running!");
app.MapGet("/test", () => Results.Ok(new { message = "Test endpoint working", port = Environment.GetEnvironmentVariable("PORT") ?? "8080" }));

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
