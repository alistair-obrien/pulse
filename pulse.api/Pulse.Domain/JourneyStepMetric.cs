namespace Pulse.Domain.Models;

public class JourneyStepMetric
{
    public int Id { get; set; }

    public int JourneyStepId { get; set; }
    public JourneyStep? JourneyStep { get; set; } = null;

    public string MetricTypeId { get; set; } = null!;
    public string JsonValue { get; set; } = null!;
}