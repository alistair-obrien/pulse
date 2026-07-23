using System.ComponentModel.DataAnnotations;

namespace Pulse.Domain.Models;

public class WorkoutLog
{
    public int Id { get; set; }

    public int DailyLogId { get; set; }
    public DailyLog? DailyLog { get; set; }

    [MaxLength(100)]
    [Required(AllowEmptyStrings = true)]
    public string WorkoutName { get; set; } = "";
    [Required]
    public TimeSpan WorkoutDuration { get; set; } = new();
    public int WorkoutVolume { get; set; }
    public int PersonalRecords { get; set; }
    [MaxLength(500)]
    [Required(AllowEmptyStrings = true)]
    public string WorkoutNotes { get; set; } = "";
}
