import typer
from scripts_python.common.context import get_environment
from . import app

@app.command()
def stop(
    environment: str | None = typer.Argument(None),
):
    """Stops the api."""
    environment = get_environment(environment)
    typer.echo(f"Stopping api for '{environment}'")