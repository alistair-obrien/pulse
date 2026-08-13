namespace Pulse.Domain.Models;

public class JourneyStepMetric
{
    public int Id { get; set; }

    public required int JourneyStepId { get; set; }
    public JourneyStep? JourneyStep { get; set; } = null;
    public required string MetricTypeId { get; set; } = null!;
    public required string JsonValue { get; set; } = null!;
}