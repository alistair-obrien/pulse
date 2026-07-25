using Pulse.Api.Integrations.IProviders;
using Pulse.Api.Models.Data;
using Pulse.Domain.Models;

namespace Pulse.Api.Services
{
    public class DailyLogImportService
    {
        private readonly IWorkoutProvider _workouts;
        private readonly INutritionProvider? _nutrition;
        private readonly ISleepProvider? _sleep;

        public DailyLogImportService(
            IWorkoutProvider workouts
            //,
            //INutritionProvider nutrition,
            //ISleepProvider sleep
            )
        {
            _workouts = workouts;
            //_nutrition = nutrition;
            //_sleep = sleep;
        }

        public async Task<DailyLogData> ImportAsync(DailyLog log)
        {
            DailyLogData data = new(log);

            var workouts = await _workouts.GetWorkoutsAsync(log.Date);
            data.Workouts.Clear();

            foreach (var workout in workouts)
            {
                data.Workouts.Add(workout);
            }

            return data;
        }
    }
}