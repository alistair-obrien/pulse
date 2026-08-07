import typer
from scripts_python.common.context import get_environment
from . import app
from .config import DatabaseConfig

from scripts_python.common import context
from scripts_python.common import docker

@app.command()
def start(
    environment: str | None = typer.Argument(None),
):
    """Starts the database."""
    
    environment = context.get_environment(environment)

    config = DatabaseConfig(environment)

    docker.compose_up(
        environment,
        config.compose_file,
        **config.compose_env,
    )

    typer.echo(f"Started database for '{environment}'.")