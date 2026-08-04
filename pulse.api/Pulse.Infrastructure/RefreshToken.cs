namespace Pulse.Infrastructure;

public class RefreshToken
{
    public int Id { get; set; }

    public required string Token { get; set; }

    public required string UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? RevokedAtUtc { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}