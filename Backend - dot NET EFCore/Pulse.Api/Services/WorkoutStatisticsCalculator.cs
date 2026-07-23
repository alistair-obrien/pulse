using Pulse.Api.Integrations.Hevy.Models;
using Pulse.Domain.Models;

namespace Pulse.Api.Services
{
    public class WorkoutStatisticsCalculator
    {
        internal int GetTotalPersonalRecordsCount(IEnumerable<WorkoutLog> workouts)
        {
            return workouts.Sum(x => x.PersonalRecords);
        }

        internal int GetTotalWorkoutVolume(IEnumerable<WorkoutLog> workouts)
        {
            return workouts.Sum(x => x.WorkoutVolume);
        }
    }
}