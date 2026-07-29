using Microsoft.EntityFrameworkCore;
using Pulse.Api.Integrations.Hevy;
using Pulse.Api.Services;
using Pulse.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddCommandLine(args);

builder.Services.AddControllers();

builder.Services.AddDbContext<PulseDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("Pulse"));
});

builder.Services
    .AddIdentityApiEndpoints<ApplicationUser>()
    .AddEntityFrameworkStores<PulseDbContext>();

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Default", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy
                .AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
        else
        {
            policy
                .WithOrigins(
                    "https://pulse-flow.app",
                    "capacitor://localhost",
                    "http://localhost"
                )
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    });
});

// Workouts
// Add this singleton. It does not require scoped services. Its just data transformation
builder.Services.AddSingleton<WorkoutStatisticsCalculator>();

// Hevy Provider
builder.Services.Configure<HevyOptions>(builder.Configuration.GetSection("Hevy"));
builder.Services.AddHttpClient<HevyClient>();
//builder.Services.AddScoped<IWorkoutProvider, HevyWorkoutProvider>();

var migrate = args.Contains("--migrate", StringComparer.OrdinalIgnoreCase);

if (migrate)
{
    await Migrate(builder);
    return;
}

// Daily Log Import Service
//builder.Services.AddScoped<DailyLogImportService>();
var app = builder.Build();

// Web Server Mode
app.UseHttpsRedirection();
app.UseCors("Default");

app.UseAuthentication();
app.UseAuthorization();

app.MapIdentityApi<ApplicationUser>();
app.MapControllers();
app.Run();














// ==== MIGRATION ===
// TODO: Move to its own console app
static async Task Migrate(WebApplicationBuilder builder)
{
    Console.WriteLine($"Migration Starting");
    Console.WriteLine($"Environment: {builder.Environment.EnvironmentName}");

    var services = builder.Services.BuildServiceProvider();

    using var scope = services.CreateScope();

    var db = scope.ServiceProvider.GetRequiredService<PulseDbContext>();

    await db.Database.MigrateAsync();

    var applied = await db.Database.GetAppliedMigrationsAsync();
    var pending = await db.Database.GetPendingMigrationsAsync();

    Console.WriteLine($"Applied: {applied.Count()}");
    foreach (var migration in applied)
        Console.WriteLine($"  Applied: {migration}");

    Console.WriteLine($"Pending: {pending.Count()}");
    foreach (var migration in pending)
        Console.WriteLine($"  Pending: {migration}");
}