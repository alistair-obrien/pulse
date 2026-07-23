using Pulse.Domain.Models;
using System.ComponentModel.DataAnnotations;

namespace Pulse.Api.Models.Data;

public class SleepLogData
{
    public double SleepHours { get; set; }
    [Required(AllowEmptyStrings = true)]
    public string SleepNotes { get; set; } = string.Empty;

    public SleepLogData() { }

    public SleepLogData(SleepLog entity)
    {
        SleepHours = entity.SleepHours;
        SleepNotes = entity.SleepNotes;
    }

    public void ApplyTo(SleepLog entity)
    {
        entity.SleepHours = SleepHours;
        entity.SleepNotes = SleepNotes;
    }

    public SleepLog ToEntity()
    {
        var entity = new SleepLog();
        ApplyTo(entity);
        return entity;
    }
}
