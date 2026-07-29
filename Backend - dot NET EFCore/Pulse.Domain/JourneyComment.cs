namespace Pulse.Domain.Models;

public class JourneyComment
{
    public int Id { get; set; }
    public required string JourneyUserId { get; set; }
    public required DateOnly JourneyDate { get; set; }
    public required string CommentedByUserId { get; set; }
    public required string Text { get; set; }
    public required DateTime CreatedUtc { get; set; }
}