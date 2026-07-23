using Pulse.Api.Models.Data;
using Pulse.Domain.Models;

namespace Pulse.Api.Models.Responses;

public class DailyLogUpdateResponse : DailyLogData
{
    public DailyLogUpdateResponse(DailyLog entity) : base(entity)
    {

    }
}