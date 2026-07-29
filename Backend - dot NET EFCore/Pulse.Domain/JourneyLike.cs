using static System.Net.Mime.MediaTypeNames;

namespace Pulse.Domain.Models;

public class JourneyLike
{
    public int Id { get; set; }
    public required string JourneyUserId { get; set; }
    public required DateOnly JourneyDate { get; set; }
    public required string LikedByUserId { get; set; }
}