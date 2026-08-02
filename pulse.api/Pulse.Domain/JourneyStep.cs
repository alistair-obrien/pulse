namespace Pulse.Domain.Models;

public class JourneyStep
{
    public string UserId { get; set; } = null!;

    public int Id { get; set; }

    public int MetricId { get; set; }
    public Metric? Metric { get; set; }
}