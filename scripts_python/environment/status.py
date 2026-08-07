import subprocess

import typer

from scripts_python.environment import app
from scripts_python.common import context

from scripts_python.registry.status import get_status as registry_status
from scripts_python.database.status import get_status as database_status
from scripts_python.api.status import get_status as api_status

@app.command()
def status(
    environment: str | None = typer.Argument(None),
):
    environment = context.get_environment(environment)

    typer.echo()
    typer.echo("Environment")
    typer.echo("───────────")
    typer.echo(f"Name      {environment}")
    typer.echo(f"Network   {network_status(environment)}")
    typer.echo(f"Registry  {registry_status(environment)}")
    typer.echo(f"Database  {database_status(environment)}")
    typer.echo(f"API       {api_status(environment)}")

def network_status(environment: str) -> str:
    network = f"{environment}_network"

    result = subprocess.run(
        [
            "docker",
            "network",
            "inspect",
            network,
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    return "Present" if result.returncode == 0 else "Missing"