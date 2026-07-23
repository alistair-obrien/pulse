using Pulse.Api.Integrations.Hevy.Models;
using System.Text.Json.Serialization;

namespace Pulse.Api.Integrations.Hevy.Responses
{
    public class HevyWorkoutEventsResponse
    {
        [JsonPropertyName("page")]
        public int Page { get; set; }
        [JsonPropertyName("page_count")]
        public int PageCount { get; set; }
        [JsonPropertyName("events")]
        public required List<HevyWorkoutEvent> Events { get; set; }
    }
}
