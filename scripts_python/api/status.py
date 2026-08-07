import typer

from . import app
from .config import compose_env

from scripts_python.common import docker
from scripts_python.common import context
from scripts_python.environment import app

@app.command()
def status(
    environment: str | None = typer.Argument(None),
):
    """Show the api status."""

    environment = context.get_environment(environment)
    typer.echo(get_status(environment))

def get_status(environment: str) -> str:
    return f"Not Implemented"

    # if not context.component_root(environment, "api").exists():
    #     return "Not installed"

    # context_name = (
    #     "External"
    #     if (context.component_root(environment, "api") / "external").exists()
    #     else "Internal"
    # )

    # running = docker.compose_running(
    #     environment,
    #     config.compose_file,
    #     "api",
    #     **config.compose_env,
    # )

    # state = "Running" if running else "Stopped"

    # return f"{context_name} ({state})"