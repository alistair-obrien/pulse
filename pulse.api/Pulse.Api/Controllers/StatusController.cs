using Microsoft.AspNetCore.Mvc;

namespace Pulse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatusController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;

    public StatusController(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    [HttpGet]
    public IActionResult Check()
    {
        return Ok(new
        {
            success = true,
            msg = "all is good",
            version = Environment.GetEnvironmentVariable("PULSE_VERSION"),
            commit = Environment.GetEnvironmentVariable("PULSE_COMMIT_SHA"),
            date = Environment.GetEnvironmentVariable("PULSE_BUILD_DATE"),
            environment = _environment.EnvironmentName
        });
    }
}