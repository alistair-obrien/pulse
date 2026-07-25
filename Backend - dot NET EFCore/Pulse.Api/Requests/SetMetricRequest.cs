using Pulse.Domain.Models;
using System.Text.Json;

namespace Pulse.Api.Requests
{
    public record SetMetricRequest(object MetricData);
}