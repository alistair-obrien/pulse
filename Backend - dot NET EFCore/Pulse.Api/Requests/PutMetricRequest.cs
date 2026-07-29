using Pulse.Domain.Models;
using System.Text.Json;

namespace Pulse.Api.Requests
{
    public record PutMetricRequest(object MetricData);
    public record PutJourneyStepRequest(object MetricData);

}