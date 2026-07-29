using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Pulse.Api.Controllers
{
    public abstract class PulseController : ControllerBase
    {
        protected string UserId =>
            User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException();
    }
}