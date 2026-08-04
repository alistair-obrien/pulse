using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.Api.Models;
using Pulse.Domain.Models;
using Pulse.Infrastructure;
using System.Text.Json;

namespace Pulse.Api.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class MetricsController : PulseController
    {
        public MetricsController(PulseDbContext db) : base(db) { }

        [HttpGet("{date}/{metricId}")]
        public async Task<IActionResult> Get(DateOnly date, string metricId)
        {
            var metric = await _db.Metrics.FirstOrDefaultAsync(m =>
                m.UserId == UserId &&
                m.Date == date &&
                m.MetricTypeId == metricId);

            if (metric == null)
                return NotFound();

            return Ok(metric.JsonValue);
        }

        [HttpGet("{date}")]
        public async Task<IActionResult> Get(DateOnly date)
        {
            Console.WriteLine("Get " + date.ToString());

            var metrics = await _db.Metrics
                .Where(
                    m => m.UserId == UserId &&
                    m.Date == date)
                .ToListAsync();

            if (metrics.Count == 0)
                return NotFound();

            return Ok(metrics.ToDictionary(
               m => m.MetricTypeId,
               m => JsonSerializer.Deserialize<JsonElement>(m.JsonValue)
           ));
        }

        [HttpPut("{date}/{metricId}")]
        public async Task<IActionResult> Put(
            DateOnly date,
            string metricId,
            PutMetricRequest request)
        {
            bool isEmpty = IsEmpty(request.MetricData);

            var metric = await _db.Metrics.FirstOrDefaultAsync(m =>
                m.UserId == UserId &&
                m.Date == date &&
                m.MetricTypeId == metricId);

            if (isEmpty)
            {
                if (metric != null)
                {
                    _db.Metrics.Remove(metric);
                    await _db.SaveChangesAsync();
                }

                return Ok(new PutMetricResponse());
            }

            if (metric == null)
            {
                metric = new Metric
                {
                    UserId = UserId,
                    Date = date,
                    MetricTypeId = metricId
                };

                _db.Metrics.Add(metric);
            }

            metric.JsonValue = JsonSerializer.Serialize(request.MetricData);
            metric.UpdatedUtc = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Ok(new PutMetricResponse());
        }

        private static bool IsEmpty(object? value)
        {
            if (value is null)
                return true;

            if (value is JsonElement json)
            {
                switch (json.ValueKind)
                {
                    case JsonValueKind.Null:
                    case JsonValueKind.Undefined:
                        return true;

                    case JsonValueKind.String:
                        return string.IsNullOrWhiteSpace(json.GetString());

                    case JsonValueKind.Number:
                        return json.TryGetDouble(out var d) && d == 0;

                    case JsonValueKind.Array:
                        return json.GetArrayLength() == 0;

                    case JsonValueKind.Object:
                        return !json.EnumerateObject().Any();
                }
            }

            return false;
        }
    }
}