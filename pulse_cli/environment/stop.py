import typer

from scripts_python.environment import app


@app.command()
def stop(
    environment: str | None = typer.Argument(None),
):
    """Stops the enviornment."""
    typer.echo(f"Stopping '{environment}'")