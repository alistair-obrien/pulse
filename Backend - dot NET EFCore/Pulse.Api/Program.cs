using Microsoft.EntityFrameworkCore;
using Pulse.Api.Integrations.Hevy;
using Pulse.Api.Services;
using Pulse.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Adds the SQL DB
builder.Services.AddDbContext<PulseDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default"));
});

// Cors for Local builds only
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("Frontend", policy =>
        {
            policy
                .AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
    });
}

// Workouts
// Add this singleton. It does not require scoped services. Its just data transformation
builder.Services.AddSingleton<WorkoutStatisticsCalculator>();

// Hevy Provider
builder.Services.Configure<HevyOptions>(builder.Configuration.GetSection("Hevy"));
builder.Services.AddHttpClient<HevyClient>();
//builder.Services.AddScoped<IWorkoutProvider, HevyWorkoutProvider>();

// Daily Log Import Service
//builder.Services.AddScoped<DailyLogImportService>();
var app = builder.Build();

app.UseHttpsRedirection();
app.UseCors("Frontend");
app.MapControllers();
app.Run();

