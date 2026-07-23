using Microsoft.Extensions.Options;
using Pulse.Api.Integrations.Hevy.Models;
using Pulse.Api.Integrations.Hevy.Responses;

namespace Pulse.Api.Integrations.Hevy
{
    public class HevyClient : ApiClient
    {
        public HevyClient(HttpClient http, IOptions<HevyOptions> options) : base(http)
        {
            Http.BaseAddress = new Uri(options.Value.BaseUrl);
            Http.Timeout = TimeSpan.FromSeconds(options.Value.Timeout);

            // Add throws if its already added so we remove first
            Http.DefaultRequestHeaders.Add(
                "api-key",
                options.Value.ApiKey);
        }

        public Task<HevyWorkoutEventsResponse> GetWorkoutEvents(
            DateOnly date, 
            int page = 1,
            int pageSize = 10)
        {
            var since = date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);

            var url =
                $"workouts/events?page={page}&pageSize={pageSize}&since={since:yyyy-MM-ddTHH:mm:ssZ}";

            return GetAsync<HevyWorkoutEventsResponse>(url);
        }
    }
}