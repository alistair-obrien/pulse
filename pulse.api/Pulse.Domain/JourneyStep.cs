namespace Pulse.Domain.Models;

public class JourneyStep
{
    public int Id { get; set; }
    public required string UserId { get; set; }
    public required DateOnly Date { get; set; }
    public ICollection<JourneyStepMetric> Metrics { get; set; } = [];
}