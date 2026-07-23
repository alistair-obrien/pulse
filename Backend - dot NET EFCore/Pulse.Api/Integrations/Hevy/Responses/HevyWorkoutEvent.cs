using Pulse.Api.Integrations.Hevy.Models;

namespace Pulse.Api.Integrations.Hevy.Responses
{
    public class HevyWorkoutEvent
    {
        public required string Type { get; set; }

        public required HevyWorkout Workout { get; set; }
    }
}
