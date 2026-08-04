using Pulse.Domain.Models;
using System.Text.Json;

namespace Pulse.Api.Models
{
    public record PutMetricRequest(object MetricData);
}