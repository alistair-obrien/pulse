using Microsoft.EntityFrameworkCore;
using Pulse.Domain.Models;
namespace Pulse.Infrastructure;

public class PulseDbContext : DbContext
{
    public PulseDbContext(
        DbContextOptions<PulseDbContext> options) : 
        base(options)
    {
    }

    public DbSet<Metric> Metrics => Set<Metric>();
}
