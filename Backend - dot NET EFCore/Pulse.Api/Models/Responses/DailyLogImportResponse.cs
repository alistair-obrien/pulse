using Pulse.Api.Models.Data;
using Pulse.Domain.Models;

namespace Pulse.Api.Models.Responses;

public class DailyLogImportResponse : DailyLogData
{
    public DailyLogImportResponse(DailyLog entity) : base(entity)
    {

    }
}