import typer
from scripts_python.common.context import get_environment
from . import app

@app.command()
def install(
    environment: str | None = typer.Argument(None),
):
    """Install an api to an environment."""
    environment = get_environment(environment)
    typer.echo(f"Installing api for '{environment}'")