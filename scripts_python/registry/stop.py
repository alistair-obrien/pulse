import typer

from . import app
from .config import RegistryConfig

from scripts_python.common import context
from scripts_python.common import docker

@app.command()
def stop(
    environment: str | None = typer.Argument(None),
):
    """Stops the registry."""

    environment = context.get_environment(environment)

    config = RegistryConfig(environment)

    docker.compose_down(
        environment,
        config.compose_file,
        **config.compose_env,
    )

    typer.echo(f"Stopped registry for '{environment}'.")