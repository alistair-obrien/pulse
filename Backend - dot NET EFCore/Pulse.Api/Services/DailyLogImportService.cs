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
            if (workouts.Any())
            {
                data.Workouts = workouts.ToList();
            }

            //log.Nutrition = await _nutrition.GetNutritionAsync(log.Date);
            //log.Sleeps = (await _sleep.GetSleepAsync(log.Date)).ToList();

            return data;
        }
    }
}