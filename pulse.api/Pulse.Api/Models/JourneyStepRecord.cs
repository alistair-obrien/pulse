namespace Pulse.Api.Models;

public record JourneyStepRecord(
    string userId,
    DateOnly date,
    string userName,
    string userProfilePicture,
    bool liked,
    int likesCount,
    object[] comments,
    object[] metricData);
