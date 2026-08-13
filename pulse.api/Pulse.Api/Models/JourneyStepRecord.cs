namespace Pulse.Api.Models;

public record JourneyStepRecord(
    int id,
    string userId,
    bool published,
    DateOnly date,
    string userName,
    string userProfilePicture,
    bool liked,
    int likesCount,
    object[] comments,
    object[] metricData);
