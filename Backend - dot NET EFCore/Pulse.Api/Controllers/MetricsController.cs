using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.Api.Requests;
using Pulse.Api.Responses;
using Pulse.Domain.Models;
using Pulse.Infrastructure;
using System.Text.Json;

namespace Pulse.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MetricsController : ControllerBase
    {
        private readonly PulseDbContext _db;
        //private readonly DailyLogImportService _importService;

        public MetricsController(PulseDbContext db/*, DailyLogImportService import*/)
        {
            _db = db;
            //_importService = import;
        }

        //[HttpPut("{id}/import")]
        //public async Task<IActionResult> Import(int id)
        //{
        //    var metric = _db. //

        //    if (metric == null)
        //        return NotFound();

        //    var imported = await _importService.ImportAsync(metric);
        //    imported.ApplyTo(metric);

        //    await _db.SaveChangesAsync();

        //    return Ok(new DailyLogImportResponse(metric));
        //}


        [HttpGet("{date}/{metricId}")]
        public async Task<IActionResult> Get(DateOnly date, string metricId)
        {
            var metric = await _db.Metrics.FirstOrDefaultAsync(m =>
                m.Date == date &&
                m.MetricTypeId == metricId);

            if (metric == null)
                return NotFound();

            return Ok(metric.JsonValue);
        }


        [HttpPut("{date}/{metricId}")]
        public async Task<IActionResult> Put(
            DateOnly date,
            string metricId,
            SetMetricRequest request)
        {
            var metric = await _db.Metrics.FirstOrDefaultAsync(m =>
                m.Date == date &&
                m.MetricTypeId == metricId);

            if (metric == null)
            {
                metric = new Metric
                {
                    Date = date,
                    MetricTypeId = metricId
                };

                _db.Metrics.Add(metric);
            }

            metric.JsonValue = JsonSerializer.Serialize(request.MetricData);
            metric.UpdatedUtc = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Ok(new SetMetricResponse());
        }
    }
}