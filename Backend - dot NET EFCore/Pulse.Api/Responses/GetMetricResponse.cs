using Pulse.Domain.Models;
using System.Text.Json;

namespace Pulse.Api.Responses;

public record GetMetricResponse(
    int page, 
    int pages,
    List<JourneyStepRecord> journeySteps);

public record JourneyStepRecord(
    string userId,
    DateOnly date,
    string userName,
    string userProfilePicture,
    bool liked,
    int likesCount,
    object[] comments,
    object[] metricData);

public record JourneyMetricRecord(
    string metricTypeId,
    JsonElement value);