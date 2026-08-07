import typer

from scripts_python.environment import app


@app.command()
def start(
    environment: str | None = typer.Argument(None),
):
    """Starts the environment."""
    typer.echo(f"Starting '{environment}'")