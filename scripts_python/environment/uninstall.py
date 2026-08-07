import shutil
import subprocess

import typer

from scripts_python.environment import app
from scripts_python.common.context import environment_root

@app.command()
def uninstall(
    environment: str | None = typer.Argument(None),
):
    """Uninstall an environment."""

    root = environment_root(environment)

    if not root.exists():
        typer.echo(f"Environment '{environment}' is not installed.")
        raise typer.Exit(code=1)

    network_name = f"{environment}_network"

    subprocess.run(
        [
            "docker",
            "network",
            "rm",
            network_name,
        ],
        check=False,  # Ignore if it doesn't exist
    )

    shutil.rmtree(root)

    typer.echo(f"Uninstalled environment '{environment}'.")