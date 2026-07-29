using Microsoft.AspNetCore.Mvc;
using Pulse.Infrastructure;
using System.Security.Claims;

namespace Pulse.Api.Controllers
{
    public abstract class PulseController : ControllerBase
    {
        protected readonly PulseDbContext _db;
        protected string UserId =>
            User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException();

        public PulseController(PulseDbContext db) { _db = db; }
    }
}