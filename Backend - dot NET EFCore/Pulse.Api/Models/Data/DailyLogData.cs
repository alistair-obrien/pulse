using Pulse.Domain.Models;
using System.ComponentModel.DataAnnotations;

namespace Pulse.Api.Models.Data;

public class DailyLogData
{
    [Required]
    public DateOnly Date { get; set; } = new();

    public bool IsPublished { get; set; } = false;

    // Reflection
    [Required(AllowEmptyStrings = true)]
    public string Reflection { get; set; } = string.Empty;

    // Sleep
    [Required]
    public List<SleepLogData> Sleeps { get; set; } = new();

    // Nutrition
    [Required]
    public NutritionData Nutrition { get; set; } = new();

    // Workout
    [Required]
    public List<WorkoutLogData> Workouts { get; set; } = new();

    // Body
    public double Weight { get; set; }
    public double BodyFatPercentage { get; set; }

    // Recovery
    public int RestingHeartRate { get; set; }
    public int Steps { get; set; }

    public bool SharePublicly { get; set; }

    public DailyLogData()
    {
    }

    public DailyLogData(DailyLog entity)
    {
        Date = entity.Date;
        IsPublished = entity.IsPublished;
        Reflection = entity.Reflection;
        Sleeps = entity.Sleeps.Select(x => new SleepLogData(x)).ToList();
        Nutrition = new NutritionData(entity.Nutrition);
        Workouts = entity.Workouts.Select(x => new WorkoutLogData(x)).ToList();
        Weight = entity.Weight;
        BodyFatPercentage = entity.BodyFatPercentage;
        RestingHeartRate = entity.RestingHeartRate;
        Steps = entity.Steps;
        SharePublicly = entity.SharePublicly;
    }

    public void ApplyTo(DailyLog entity)
    {
        entity.Date = Date;
        entity.IsPublished = IsPublished; //Not sure...
        entity.Reflection = Reflection;

        entity.Sleeps.Clear();
        foreach (var sleep in Sleeps)
        {
            entity.Sleeps.Add(sleep.ToEntity());
        }

        Console.WriteLine(entity.Nutrition == null);
        Nutrition.ApplyTo(entity.Nutrition);

        entity.Workouts.Clear();
        foreach (var workout in Workouts)
        {
            entity.Workouts.Add(workout.ToEntity());
        }

        entity.Weight = Weight;
        entity.BodyFatPercentage = BodyFatPercentage;
        entity.RestingHeartRate = RestingHeartRate;
        entity.Steps = Steps;
        entity.SharePublicly = SharePublicly;
    }

    public DailyLog ToEntity()
    {
        var entity = new DailyLog();
        ApplyTo(entity);
        return entity;
    }
}