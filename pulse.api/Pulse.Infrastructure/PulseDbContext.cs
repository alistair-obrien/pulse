using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Pulse.Domain.Models;
using System.Reflection.Emit;
namespace Pulse.Infrastructure;

public class PulseDbContext : IdentityDbContext<ApplicationUser>
{
    public PulseDbContext(
        DbContextOptions<PulseDbContext> options) : 
        base(options)
    {
    }

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    public DbSet<Metric> Metrics => Set<Metric>();
    public DbSet<JourneyStep> JourneySteps => Set<JourneyStep>();
    public DbSet<JourneyStepMetric> JourneyStepMetrics => Set<JourneyStepMetric>();
    public DbSet<JourneyLike> JourneyLikes => Set<JourneyLike>();
    public DbSet<JourneyComment> JourneyComments => Set<JourneyComment>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Links the User Id to the metric as we dont want to leak the Infrastructure user
        builder.Entity<Metric>()
            .HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(m => m.UserId);

        // Prevents Duplicates
        builder.Entity<Metric>()
            .HasIndex(m => new
            {
                m.UserId,
                m.Date,
                m.MetricTypeId
            })
            .IsUnique();

        builder.Entity<JourneyStep>()
            .HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(m => m.UserId);

        builder.Entity<JourneyStep>()
            .HasIndex(x => new { x.UserId, x.Date })
            .IsUnique();

        builder.Entity<JourneyLike>()
            .HasIndex(m => new
            {
                m.JourneyUserId,
                m.JourneyDate,
                m.LikedByUserId
            })
            .IsUnique();

        builder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(x => x.Token)
                .IsUnique();

            entity.Property(x => x.Token)
                .HasMaxLength(43); // Base64Url-encoded 32 random bytes

            entity.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}