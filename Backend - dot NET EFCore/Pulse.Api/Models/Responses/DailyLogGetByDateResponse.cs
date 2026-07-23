using Pulse.Api.Models.Data;
using Pulse.Domain.Models;

namespace Pulse.Api.Models.Responses;

public class DailyLogGetByDateResponse : DailyLogData
{
    public int Id { get; set; }

    public DailyLogGetByDateResponse(DailyLog entity) : base(entity)
    {
        Id = entity.Id;
    }
}