namespace Pulse.Domain.Models;

public class Metric
{
    public int Id { get; set; }

    public DateOnly Date { get; set; }

    public string MetricTypeId { get; set; } = null!;

    public string JsonValue { get; set; } = null!;

    public DateTime UpdatedUtc { get; set; }
}