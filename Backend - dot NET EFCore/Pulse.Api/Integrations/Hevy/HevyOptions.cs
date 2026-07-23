namespace Pulse.Api.Integrations.Hevy
{
    public class HevyOptions
    {
        public string ApiKey { get; set; } = "";
        public string BaseUrl { get; set; } = "";
        public int Timeout { get; set; } = 0;
    }
}