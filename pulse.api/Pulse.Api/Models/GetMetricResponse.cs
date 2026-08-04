using Pulse.Domain.Models;

namespace Pulse.Api.Models;

public record GetMetricResponse(
    int page, 
    int pages,
    List<JourneyStepRecord> journeySteps);
