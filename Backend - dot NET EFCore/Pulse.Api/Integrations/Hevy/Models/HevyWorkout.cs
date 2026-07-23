using System.Text.Json.Serialization;

namespace Pulse.Api.Integrations.Hevy.Models
{
    public class HevyWorkout
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = "";
        [JsonPropertyName("title")]
        public string Title { get; set; } = "";
        [JsonPropertyName("description")]
        public string Description { get; set; } = "";
        [JsonPropertyName("start_time")]
        public DateTime StartTime { get; set; }
        [JsonPropertyName("end_time")]
        public DateTime EndTime { get; set; }
        [JsonPropertyName("exercises")]
        public List<HevyExercise> Exercises { get; set; } = [];
    }
}