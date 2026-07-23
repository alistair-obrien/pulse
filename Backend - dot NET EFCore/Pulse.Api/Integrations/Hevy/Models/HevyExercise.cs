using System.Text.Json.Serialization;

namespace Pulse.Api.Integrations.Hevy.Models
{
    public class HevyExercise
    {
        [JsonPropertyName("title")]
        public string Title { get; set; } = "";
        [JsonPropertyName("sets")]
        public List<HevySet> Sets { get; set; } = [];
    }
}
