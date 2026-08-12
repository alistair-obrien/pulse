using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Pulse.Infrastructure;

namespace Pulse.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class UserDataController : PulseController
{
    private readonly UserManager<ApplicationUser> _userManager;

    public UserDataController(
        PulseDbContext db,
        UserManager<ApplicationUser> userManager)
        : base(db)
    {
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<ActionResult<UserDataDto>> Get()
    {
        var user = await _userManager.GetUserAsync(User);

        if (user == null)
            return Unauthorized();

        return Ok(new UserDataDto
        {
            DisplayName = user.DisplayName,
            ProfileImage = user.ProfileImage
        });
    }

    [HttpPut]
    public async Task<IActionResult> Set(UserDataDto data)
    {
        var user = await _userManager.GetUserAsync(User);

        if (user == null)
            return Unauthorized();

        if (data.DisplayName is not null)
            user.DisplayName = data.DisplayName;

        if (data.ProfileImage is not null)
            user.ProfileImage = data.ProfileImage;

        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok(true);
    }
}

public class UserDataDto
{
    public string? DisplayName { get; set; }

    public string? ProfileImage { get; set; }
}