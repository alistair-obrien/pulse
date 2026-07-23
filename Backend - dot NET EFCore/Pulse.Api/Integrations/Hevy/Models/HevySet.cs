using System.Text.Json.Serialization;

namespace Pulse.Api.Integrations.Hevy.Models
{
    public class HevySet
    {
        public int Index { get; set; }
        [JsonPropertyName("type")]
        public required string Type { get; set; } // "warmup",
        [JsonPropertyName("weight_kg")]
        public double? WeightKg { get; set; }
        [JsonPropertyName("reps")]
        public int? Reps { get; set; }
        [JsonPropertyName("distance_meters")]
        public double? DistanceMeters { get; set; }
        [JsonPropertyName("duration_seconds")]
        public int? DurationSeconds { get; set; }

        //"rpe": null,
        //"custom_metric": null
    }
}