using System.Text.Json;

namespace Pulse.Api.Models;

public record JourneyMetricRecord(
    string metricTypeId,
    JsonElement value);