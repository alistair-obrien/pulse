using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Pulse.Api.Models;
using Pulse.Api.Options;
using Pulse.Api.Services;
using Pulse.Infrastructure;

namespace Pulse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly PulseAuthenticationService _authenticationService;

    public AuthController(
        PulseAuthenticationService authenticationService)
    {
        _authenticationService = authenticationService;
    }

    [HttpPost("google")]
    public async Task<IActionResult> Google(GoogleLoginRequest request)
    {
        return Ok(await _authenticationService.LoginWithGoogle(request));
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(RefreshTokenRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Token)) 
        {
            return BadRequest("Token can't be null or empty");
        }

        return Ok(await _authenticationService.Refresh(request.Token));
    }
}
