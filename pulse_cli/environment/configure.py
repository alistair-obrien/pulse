import typer

from scripts_python.environment import app

@app.command()
def configure(
    environment: str | None = typer.Argument(None),
):
    """Configure the environment."""

    # Present multiple configure options

    # External Registry URL
    # External DB URL
    

# @app.command()
# def connect_external_registry(
#     environment: str | None = typer.Argument(None),
# ):
#     """Connect an external registry."""
#     typer.echo(f"Connecting external registry to '{environment}'")

# @app.command()
# def connect_external_database(
#     environment: str | None = typer.Argument(None),
# ):
#     """Connect an external database."""
#     typer.echo(f"Connecting external database to '{environment}'")