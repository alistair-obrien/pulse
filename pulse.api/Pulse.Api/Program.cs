using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Pulse.Api.Options;
using Pulse.Api.Services;
using Pulse.Infrastructure;
using System.Text;

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

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new()
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),

            ClockSkew = TimeSpan.Zero,
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Default", policy =>
    {
        Console.Write($"Environment: {builder.Environment.EnvironmentName}");
        if (builder.Environment.IsProduction()) 
        {
            policy
                .WithOrigins(
                    "https://pulse-flow.app"
                )
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
        else if (builder.Environment.IsDevelopment())
        {
            policy
                 .AllowAnyOrigin()
                 .AllowAnyHeader()
                 .AllowAnyMethod();
        }
        // Local or Custom environments
        else
        {
            policy
                .AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    });
});


builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
builder.Services.Configure<GoogleOptions>(builder.Configuration.GetSection("Google"));

builder.Services.AddScoped<PulseAuthenticationService>();
builder.Services.AddHttpClient();

var app = builder.Build();

// Migrations
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PulseDbContext>();

    Console.WriteLine("Checking for pending migrations");

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

// Web Server Mode
//app.UseHttpsRedirection();
app.UseCors("Default");

app.UseAuthentication();
app.UseAuthorization();

app.MapIdentityApi<ApplicationUser>();
app.MapControllers();
app.Run();