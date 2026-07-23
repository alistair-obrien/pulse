using Pulse.Domain.Models;
using System.ComponentModel.DataAnnotations;

namespace Pulse.Api.Models.Data;

public class WorkoutLogData
{
    [Required(AllowEmptyStrings = true)]
    public string WorkoutName { get; set; } = string.Empty;
    [Required]
    public TimeSpan WorkoutDuration { get; set; } = new();

    public int WorkoutVolume { get; set; }

    public int PersonalRecords { get; set; }
    [Required(AllowEmptyStrings = true)]
    public string WorkoutNotes { get; set; } = string.Empty;

    public WorkoutLogData() { }

    public WorkoutLogData(WorkoutLog entity)
    {
        WorkoutName = entity.WorkoutName;
        WorkoutDuration = entity.WorkoutDuration;
        WorkoutVolume = entity.WorkoutVolume;
        PersonalRecords = entity.PersonalRecords;
        WorkoutNotes = entity.WorkoutNotes;
    }
    
    public void ApplyTo(WorkoutLog entity)
    {
        entity.WorkoutName = WorkoutName;
        entity.WorkoutDuration = WorkoutDuration;
        entity.WorkoutVolume = WorkoutVolume;
        entity.PersonalRecords = PersonalRecords;
        entity.WorkoutNotes = WorkoutNotes;
    }

    public WorkoutLog ToEntity()
    {
        var entity = new WorkoutLog();
        ApplyTo(entity);
        return entity;
    }
}
