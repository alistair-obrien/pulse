using Pulse.Api.Models.Data;
using Pulse.Domain.Models;

namespace Pulse.Api.Models.Responses;

public class DailyLogPublishResponse : DailyLogData
{
    public DailyLogPublishResponse(DailyLog entity) : base(entity)
    {

    }
}