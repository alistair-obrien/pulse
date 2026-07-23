using System.ComponentModel.DataAnnotations;

namespace Pulse.Domain.Models;

// Sleep
// TODO: Sleep Sessions so we can separate naps from main
public class SleepLog
{
    public int Id { get; set; }

    public int DailyLogId { get; set; }
    public DailyLog? DailyLog { get; set; }

    public double SleepHours { get; set; }
    [MaxLength(500)]
    [Required(AllowEmptyStrings = true)]
    public string SleepNotes { get; set; } = "";
}