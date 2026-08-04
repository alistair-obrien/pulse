
using Microsoft.AspNetCore.Identity;

namespace Pulse.Infrastructure;

public class ApplicationUser : IdentityUser
{
    public string DisplayName { get; set; } = "";
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public string? ProfileImage { get; set; } = "";
}