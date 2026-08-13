namespace Pulse.Domain.Models;

public class JourneyLike
{
    public int Id { get; set; }
    public required int JourneyStepId { get; set; }
    public JourneyStep? JourneyStep { get; set; }
    public required string LikedByUserId { get; set; }
}