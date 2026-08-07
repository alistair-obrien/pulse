import typer

from scripts_python.environment import app

@app.command()
def status(
    environment: str | None = typer.Argument(None),
):
    """Starts the environment."""
    typer.echo(f"Status '{environment}'")