namespace Pulse.Api.Options
{
    public sealed class JwtOptions
    {
        public string Key { get; init; } = "";
        public string Issuer { get; init; } = "";
        public string Audience { get; init; } = "";
        public int ExpiryInSeconds { get; init; }
        public double RefreshTokenExpiryInDays { get; init; }
    }
}
