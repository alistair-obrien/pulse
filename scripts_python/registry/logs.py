import typer

from . import app
from .config import RegistryConfig

from scripts_python.common import context
from scripts_python.common import docker

@app.command()
def logs(
    environment: str | None = typer.Argument(None)
):
    """View registry logs."""

    environment = context.get_environment(environment)

    config = RegistryConfig(environment)


    docker.compose_logs(
        environment,
        config.compose_file,
        **config.compose_env)