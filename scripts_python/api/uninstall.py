import typer
from scripts_python.common.context import get_environment
from . import app

@app.command()
def uninstall(
    environment: str | None = typer.Argument(None),
):
    """Uninstall an api from an environment."""
    environment = get_environment(environment)
    typer.echo(f"Installing api for '{environment}'")