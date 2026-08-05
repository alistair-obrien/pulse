using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.Api.Models;
using Pulse.Domain.Models;
using Pulse.Infrastructure;
using System.Text.Json;

namespace Pulse.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class JourneyStepsController : PulseController
{
    private const int PageSize = 50;

    public JourneyStepsController(PulseDbContext db) : base(db)
    {
    }

    [HttpGet("{page:int}")]
    public async Task<IActionResult> Get(int page)
    {
        var publishedMetrics = await (
            from journeyStep in _db.JourneySteps
            join metric in _db.Metrics on journeyStep.MetricId equals metric.Id
            join user in _db.Users on journeyStep.UserId equals user.Id
            orderby metric.Date descending
            select new
            {
                JourneyStepId = journeyStep.Id,
                journeyStep.UserId,
                UserName = user.UserName,
                UserProfilePicture = user.ProfileImage,
                Metric = metric
            })
            .ToListAsync();

        var grouped = publishedMetrics
            .GroupBy(x => new
            {
                x.UserId,
                x.Metric.Date
            })
            .Skip(page * PageSize)
            .Take(PageSize);

        var journeySteps = new List<JourneyStepRecord>();

        foreach (var group in grouped)
        {
            var first = group.First();

            var metricData = group
                .Select(x => new JourneyMetricRecord(
                    metricTypeId: x.Metric.MetricTypeId,
                    value: JsonSerializer.Deserialize<JsonElement>(x.Metric.JsonValue)))
                .ToArray();

            journeySteps.Add(new JourneyStepRecord(
                userId: first.UserId,
                date: first.Metric.Date,
                userName: first.UserName ?? "",
                userProfilePicture: first.UserProfilePicture,
                liked: false,
                likesCount: 0,
                comments: [],
                metricData: metricData));
        }

        return Ok(new GetMetricResponse(
            page,
            pages: 1,
            journeySteps));
    }

    //, PutJourneyStepRequest request - For later
    [HttpPut("{date}")]
    public async Task<IActionResult> Put(DateOnly date)
    {
        var metrics = await _db.Metrics
            .Where(x => x.UserId == UserId && x.Date == date)
            .ToListAsync();

        var publishedMetricIds = await _db.JourneySteps
            .Where(x => x.UserId == UserId)
            .Select(x => x.MetricId)
            .ToHashSetAsync();

        foreach (var metric in metrics)
        {
            if (publishedMetricIds.Contains(metric.Id))
                continue;

            _db.JourneySteps.Add(new JourneyStep
            {
                UserId = UserId,
                MetricId = metric.Id
            });
        }

        await _db.SaveChangesAsync();

        return Ok(new PutJourneyStepResponse());
    }

    [HttpPut("{date}/{userId}/like")]
    public async Task<IActionResult> Put(DateOnly date, string userId)
    {
        var existingLike = await _db.JourneyLikes
            .AnyAsync(
                x => x.LikedByUserId == UserId &&
                x.JourneyUserId == userId &&
                x.JourneyDate == date);

        if (existingLike)
        {
            var like = await _db.JourneyLikes.SingleAsync(x =>
                x.LikedByUserId == UserId &&
                x.JourneyUserId == userId &&
                x.JourneyDate == date);

            _db.JourneyLikes.Remove(like);
            await _db.SaveChangesAsync();

            return Ok(new { liked = false });
        }

        _db.JourneyLikes.Add(new JourneyLike
        {
            JourneyDate = date,
            JourneyUserId = userId,
            LikedByUserId = UserId
        });

        await _db.SaveChangesAsync();

        return Ok(new { liked = true });
    }
}