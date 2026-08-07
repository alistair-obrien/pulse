import typer

from . import app
from .config import DatabaseConfig

from scripts_python.common import docker
from scripts_python.common import context
from scripts_python.environment import app

@app.command()
def status(
    environment: str | None = typer.Argument(None),
):
    """Show the database status."""

    environment = context.get_environment(environment)
    typer.echo(get_status(environment))

def get_status(environment: str) -> str:

    config = DatabaseConfig(environment)
    
    if config.remote:
        # TODO: Ping
        return "Remote"

    if not config.registry_home.exists():
        return "Not installed"

    running = docker.compose_running(
        environment,
        config.compose_file,
        "database",
        **config.compose_env,
    )

    state = "Running" if running else "Stopped"

    return f"{"Local"} ({state})"