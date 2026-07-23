using Pulse.Domain.Models;
using System.ComponentModel.DataAnnotations;

namespace Pulse.Api.Models.Data;

public class NutritionData
{
    public int Calories { get; set; }
    public int Protein { get; set; }
    public int Carbs { get; set; }
    public int Fat { get; set; }

    [Required(AllowEmptyStrings = true)]
    public string NutritionNotes { get; set; } = string.Empty;

    public NutritionData() { }

    public NutritionData(Nutrition entity)
    {
        Calories = entity.Calories;
        Protein = entity.Protein;
        Carbs = entity.Carbs;
        Fat = entity.Fat;
        NutritionNotes = entity.NutritionNotes;
    }

    public void ApplyTo(Nutrition entity)
    {
        entity.Calories = Calories;
        entity.Protein = Protein;
        entity.Carbs = Carbs;
        entity.Fat = Fat;
        entity.NutritionNotes = NutritionNotes;
    }

    internal Nutrition ToEntity()
    {
        var entity = new Nutrition();
        ApplyTo(entity);
        return entity;
    }
}
