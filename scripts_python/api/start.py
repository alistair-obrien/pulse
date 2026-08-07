import typer
from scripts_python.common.context import get_environment
from . import app

@app.command()
def start(
    environment: str | None = typer.Argument(None),
):
    """Starts the api."""
    environment = get_environment(environment)
    typer.echo(f"Starting api for '{environment}'")