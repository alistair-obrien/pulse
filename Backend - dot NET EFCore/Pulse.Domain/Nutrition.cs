using System.ComponentModel.DataAnnotations;

namespace Pulse.Domain.Models;

public class Nutrition
{
    public int Id { get; set; }

    public int DailyLogId { get; set; }
    public DailyLog? DailyLog { get; set; }

    public int Calories { get; set; }
    public int Protein { get; set; }
    public int Carbs { get; set; }
    public int Fat { get; set; }
    [MaxLength(500)]
    [Required(AllowEmptyStrings = true)]
    public string NutritionNotes { get; set; } = "";
}
