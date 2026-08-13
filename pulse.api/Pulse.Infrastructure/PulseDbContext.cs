using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Pulse.Domain.Models;

namespace Pulse.Infrastructure;

public class PulseDbContext : IdentityDbContext<ApplicationUser>
{
    public PulseDbContext(
        DbContextOptions<PulseDbContext> options) : base(options)
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

        builder.Entity<Metric>()
            .HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(x => x.UserId);

        builder.Entity<Metric>()
            .HasIndex(x => new
            {
                x.UserId,
                x.Date,
                x.MetricTypeId
            })
            .IsUnique();

        builder.Entity<JourneyStep>()
            .HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(x => x.UserId);

        builder.Entity<JourneyStep>()
            .HasIndex(x => new
            {
                x.UserId,
                x.Date
            })
            .IsUnique();

        builder.Entity<JourneyLike>()
            .HasIndex(x => new
            {
                x.JourneyStepId,
                x.LikedByUserId
            })
            .IsUnique();

        builder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(x => x.Token)
                .IsUnique();

            entity.Property(x => x.Token)
                .HasMaxLength(43);
        });
    }
}