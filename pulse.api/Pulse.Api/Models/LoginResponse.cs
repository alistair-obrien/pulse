namespace Pulse.Api.Models
{
    public sealed record LoginResponse(
        string AccessToken,
        string RefreshToken,
        int ExpiryInSeconds,
        string userId
    );
}