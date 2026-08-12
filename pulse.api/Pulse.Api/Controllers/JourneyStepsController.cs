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
        var journeySteps = await _db.JourneySteps
            .Include(x => x.Metrics)
            .OrderByDescending(x => x.Date)
            .Skip(page * PageSize)
            .Take(PageSize)
            .ToListAsync();

        var userIds = journeySteps
            .Select(x => x.UserId)
            .Distinct()
            .ToList();

        var users = await _db.Users
            .Where(x => userIds.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id);

        var records = new List<JourneyStepRecord>();

        foreach (var journeyStep in journeySteps)
        {
            var likes = await _db.JourneyLikes
                .Where(x =>
                    x.JourneyUserId == journeyStep.UserId &&
                    x.JourneyDate == journeyStep.Date)
                .ToListAsync();

            var liked = likes.Any(x => x.LikedByUserId == UserId);

            var metricData = journeyStep.Metrics
                .Select(x => new JourneyMetricRecord(
                    metricTypeId: x.MetricTypeId,
                    value: JsonSerializer.Deserialize<JsonElement>(x.JsonValue)))
                .ToArray();

            var user = users[journeyStep.UserId];

            records.Add(new JourneyStepRecord(
                userId: journeyStep.UserId,
                published: true,
                date: journeyStep.Date,
                userName: user.DisplayName ?? "",
                userProfilePicture: user.ProfileImage ?? "",
                liked: liked,
                likesCount: likes.Count,
                comments: [],
                metricData: metricData));
        }

        return Ok(new GetMetricResponse(
            page,
            pages: 1,
            records));
    }

    // Returns the journey step for the user from date
    [HttpGet("date/{date}")]
    public async Task<IActionResult> Get(DateOnly date)
    {
        var journeyStep = await _db.JourneySteps
            .Include(x => x.Metrics)
            .SingleOrDefaultAsync(x =>
                x.UserId == UserId &&
                x.Date == date);

        if (journeyStep == null)
            return Ok(null);

        var metricData = journeyStep.Metrics
            .Select(x => new JourneyMetricRecord(
                metricTypeId: x.MetricTypeId,
                value: JsonSerializer.Deserialize<JsonElement>(x.JsonValue)))
            .ToArray();

        return Ok(new JourneyStepRecord(
            userId: journeyStep.UserId,
            published: true,
            date: journeyStep.Date,
            userName: "",
            userProfilePicture: "",
            liked: false,
            likesCount: 0,
            comments: [],
            metricData: metricData));
    }

    [HttpPut("{date}")]
    public async Task<IActionResult> Put(DateOnly date)
    {
        var metrics = await _db.Metrics
            .Where(x =>
                x.UserId == UserId &&
                x.Date == date)
            .ToListAsync();

        var journeyStep = await _db.JourneySteps
            .Include(x => x.Metrics)
            .SingleOrDefaultAsync(x =>
                x.UserId == UserId &&
                x.Date == date);

        if (journeyStep == null)
        {
            journeyStep = new JourneyStep
            {
                UserId = UserId,
                Date = date
            };

            _db.JourneySteps.Add(journeyStep);
        }
        else
        {
            _db.JourneyStepMetrics.RemoveRange(journeyStep.Metrics);
            journeyStep.Metrics.Clear();
        }

        foreach (var metric in metrics)
        {
            journeyStep.Metrics.Add(new JourneyStepMetric
            {
                MetricTypeId = metric.MetricTypeId,
                JsonValue = metric.JsonValue
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