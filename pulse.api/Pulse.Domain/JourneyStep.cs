namespace Pulse.Domain.Models;

public class JourneyStep
{
    public int Id { get; set; }

    public string UserId { get; set; } = null!;
    
    public DateOnly Date { get; set; }

    public ICollection<JourneyStepMetric> Metrics { get; set; } = [];
}