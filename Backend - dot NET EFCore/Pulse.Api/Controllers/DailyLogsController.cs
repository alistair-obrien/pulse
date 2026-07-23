using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.Api.Models.Requests;
using Pulse.Api.Models.Responses;
using Pulse.Api.Services;
using Pulse.Infrastructure;

namespace Pulse.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DailyLogsController : ControllerBase
    {
        private readonly PulseDbContext _db;
        private readonly DailyLogImportService _import;

        public DailyLogsController(PulseDbContext db, DailyLogImportService import)
        {
            _db = db;
            _import = import;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var log = await _db.DailyLogs
                .Include(d => d.Sleeps)
                .Include(d => d.Nutrition)
                .Include(d => d.Workouts)
                .AsSplitQuery()
                .FirstOrDefaultAsync(d => d.Id == id);

            if (log == null)
                return NotFound();

            DailyLogGetByIdResponse dailyLogResponse = new DailyLogGetByIdResponse(log);

            return Ok(dailyLogResponse);
        }

        [HttpGet("by-date/{date}")]
        public async Task<IActionResult> GetByDate(DateOnly date)
        {
            var log = await _db.DailyLogs
                .Include(d => d.Sleeps)
                .Include(d => d.Nutrition)
                .Include(d => d.Workouts)
                .AsSplitQuery()
                .FirstOrDefaultAsync(d => d.Date == date);

            if (log == null)
                return NotFound();

            DailyLogGetByDateResponse dailyLogResponse = new DailyLogGetByDateResponse(log);

            return Ok(dailyLogResponse);
        }

        [HttpPost]
        public async Task<IActionResult> Create(DailyLogCreateRequest request)
        {
            var log = request.ToEntity();

            _db.DailyLogs.Add(log);

            await _db.SaveChangesAsync();

            DailyLogCreateResponse dailyLogResponse = new DailyLogCreateResponse(log);

            return CreatedAtAction(
                nameof(GetById),
                new { id = log.Id },
                dailyLogResponse);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, DailyLogUpdateRequest request)
        {
            var log = await _db.DailyLogs
                .Include(d => d.Sleeps)
                .Include(d => d.Nutrition)
                .Include(d => d.Workouts)
                .AsSplitQuery()
                .FirstOrDefaultAsync(d => d.Id == id);

            if (log == null)
                return NotFound();

            request.ApplyTo(log);

            await _db.SaveChangesAsync();

            return Ok(new DailyLogUpdateResponse(log));
        }

        [HttpPost("{id}/publish")]
        public async Task<IActionResult> Publish(int id)
        {
            var log = await _db.DailyLogs.FindAsync(id);

            if (log == null)
                return NotFound();

            log.IsPublished = true;
            log.PublishedAt = DateTime.UtcNow;

            DailyLogPublishResponse dailyLogResponse = new DailyLogPublishResponse(log);

            await _db.SaveChangesAsync();

            return Ok(dailyLogResponse);
        }

        [HttpPut("{id}/import")]
        public async Task<IActionResult> Import(int id)
        {
            var log = await _db.DailyLogs
                .Include(d => d.Sleeps)
                .Include(d => d.Nutrition)
                .Include(d => d.Workouts)
                .AsSplitQuery()
                .FirstOrDefaultAsync(d => d.Id == id);

            if (log == null)
                return NotFound();

            var imported = await _import.ImportAsync(log);
            imported.ApplyTo(log);

            await _db.SaveChangesAsync();

            return Ok(new DailyLogImportResponse(log));
        }
    }
}