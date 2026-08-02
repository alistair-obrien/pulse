namespace Pulse.Domain.Models;

public class Metric
{
    public string? UserId { get; set; } = null!; // Temp nullable while migrating

    public int Id { get; set; }

    public JourneyStep? JourneyStep { get; set; }

    public DateOnly Date { get; set; }

    public string MetricTypeId { get; set; } = null!;

    public string JsonValue { get; set; } = null!;

    public DateTime UpdatedUtc { get; set; }
}
