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

    public DbSet<Metric> Metrics => Set<Metric>();
    public DbSet<JourneyStep> JourneySteps => Set<JourneyStep>();
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
            .HasOne(j => j.Metric)
            .WithOne(m => m.JourneyStep)
            .HasForeignKey<JourneyStep>(j => j.MetricId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<JourneyLike>()
            .HasIndex(m => new
            {
                m.JourneyUserId,
                m.JourneyDate,
                m.LikedByUserId
            })
            .IsUnique();
    }
}