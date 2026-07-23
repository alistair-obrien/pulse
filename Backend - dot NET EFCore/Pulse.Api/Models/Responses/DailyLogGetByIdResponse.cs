using Pulse.Api.Models.Data;
using Pulse.Domain.Models;

namespace Pulse.Api.Models.Responses;

public class DailyLogGetByIdResponse : DailyLogData
{
    public DailyLogGetByIdResponse(DailyLog entity) : base(entity)
    {

    }
}
