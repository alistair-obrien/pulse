using Azure;
using Pulse.Api.Integrations.Hevy;
using Pulse.Api.Integrations.Hevy.Models;
using Pulse.Api.Integrations.IProviders;
using Pulse.Api.Models.Data;
using Pulse.Api.Services;

public class HevyWorkoutProvider : IWorkoutProvider
{
    private readonly HevyClient _client;

    public HevyWorkoutProvider(HevyClient client)
    {
        _client = client;
    }

    public async Task<IReadOnlyList<WorkoutLogData>> GetWorkoutsAsync(DateOnly date)
    {
        var workouts = await _client.GetWorkoutEvents(date);

        return workouts
            .Events
            .Select(e => e.Workout)
            //.Where(w => DateOnly.FromDateTime(w.StartTime) == date)
            .Select(Convert)
            .ToList();
    }

    private WorkoutLogData Convert(HevyWorkout workout)
    {
        return new WorkoutLogData
        {
            WorkoutName = workout.Title,
            WorkoutDuration = workout.EndTime - workout.StartTime,
            WorkoutVolume = GetTotalWorkoutVolume(workout),
            PersonalRecords = GetWorkoutPersonalRecords(workout),
            WorkoutNotes = workout.Description
        };
    }

    private int GetWorkoutPersonalRecords(HevyWorkout workout)
    {
        return 0; // TODO: This is a bit more complex because we have to compare
    }

    private int GetTotalWorkoutVolume(HevyWorkout workout)
    {
        return (int)workout.Exercises.Sum(exercise =>
            exercise.Sets
                .Where(set => set.Type == "normal")
                .Sum(set => (set.WeightKg ?? 0) * (set.Reps ?? 0)));
    }
}