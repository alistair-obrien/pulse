import subprocess
import typer

from scripts_python.environment import app
from scripts_python.common.context import environment_root

@app.command()
def install(
    environment: str | None = typer.Argument(None),
    ):
    root = environment_root(environment)

    if root.exists():
        typer.echo(f"Environment '{environment}' is already installed.")
        raise typer.Exit(code=1)

    root.mkdir(parents=True)

    network_name = f"{environment}_network"

    subprocess.run(
    [
        "docker",
        "network",
        "create",
        network_name,
    ],
        check=True,
    )

    typer.echo(f"Installed environment '{environment}'.")