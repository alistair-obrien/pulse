using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Pulse.Infrastructure;

namespace Pulse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;

    public AuthController(
        UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    [HttpPost("google")]
    public async Task<IActionResult> Google(GoogleLoginRequest request)
    {
        Console.WriteLine("GOOGLE LOGIN HIT");

        var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken);

        var user = await _userManager.FindByEmailAsync(payload.Email);

        if (user == null)
        {
            user = new ApplicationUser
            {
                UserName = payload.Email,
                Email = payload.Email,
                EmailConfirmed = payload.EmailVerified
            };

            var result = await _userManager.CreateAsync(user);

            if (!result.Succeeded)
                return BadRequest(result.Errors);
        }

        return Ok();
    }
}

public record GoogleLoginRequest(string IdToken);