import typer

from . import app
from .config import RegistryConfig

from scripts_python.common import context
from scripts_python.common import docker

@app.command()
def start(
    environment: str | None = typer.Argument(None),
):
    """Starts the registry."""

    environment = context.get_environment(environment)

    config = RegistryConfig(environment)

    docker.compose_up(
        environment,
        config.compose_file,
        **config.compose_env,
    )

    typer.echo(f"Started registry for '{environment}'.")