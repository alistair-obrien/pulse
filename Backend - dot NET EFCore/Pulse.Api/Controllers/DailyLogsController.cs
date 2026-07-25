using Microsoft.AspNetCore.Mvc;
using Pulse.Infrastructure;

namespace Pulse.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DailyLogsController : ControllerBase
    {
        private readonly PulseDbContext _db;

        public DailyLogsController(PulseDbContext db)
        {
            _db = db;
        }

        //[HttpPost("{id}/publish")]
        //public async Task<IActionResult> Publish(int id)
        //{
        //    var log = await _db.Metrics.FindAsync(id);

        //    if (log == null)
        //        return NotFound();

        //    log.IsPublished = true;
        //    log.PublishedAt = DateTime.UtcNow;

        //    DailyLogPublishResponse dailyLogResponse = new DailyLogPublishResponse(log);

        //    await _db.SaveChangesAsync();

        //    return Ok(dailyLogResponse);
        //}
    }
}