using Pulse.Api.Models.Data;
using Pulse.Domain.Models;

namespace Pulse.Api.Models.Responses;

public class DailyLogCreateResponse : DailyLogData
{
    public int Id { get; set; }

    public DailyLogCreateResponse(DailyLog entity) : base(entity)
    {
        Id = entity.Id;
    }
}