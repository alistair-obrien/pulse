using System.ComponentModel.DataAnnotations;

namespace Pulse.Domain.Models;

public class DailyLog
{
    public int Id { get; set; }
    public bool IsPublished { get; set; } = false;
    public DateTime? PublishedAt { get; set; }
    [Required]
    public DateOnly Date { get; set; } = new();

    // Overall Reflection
    [MaxLength(500)]
    [Required(AllowEmptyStrings = true)]
    public string Reflection { get; set; } = "";

    // Sleep
    [Required]
    public List<SleepLog> Sleeps { get; set; } = new();

    // Nutrition
    [Required]
    public Nutrition Nutrition { get; set; } = new();

    // Workout
    [Required]
    public List<WorkoutLog> Workouts { get; set; } = new();

    // Body
    public double Weight { get; set; }
    public double BodyFatPercentage { get; set; }

    // Recovery
    public int RestingHeartRate { get; set; }
    public int Steps { get; set; }

    public bool SharePublicly { get; set; }
}