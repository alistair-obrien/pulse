import typer

from scripts_python.common import context
from scripts_python.common import docker
from scripts_python.common.files import remove_directory
from scripts_python.common.log import (
    log_job_header,
    log_job_footer,
    log_warning,
)

from . import app
from .config import RegistryConfig


@app.command()
def uninstall(
    environment: str | None = typer.Argument(None),
):
    """Uninstall the registry."""

    environment = context.get_environment(environment)

    config = RegistryConfig(environment)

    if not config.registry_home.exists():
        log_warning("Registry is not installed.")
        return

    if docker.compose_running(
        environment,
        config.compose_file,
        "registry",
        **config.compose_env,
    ):
        log_warning("Registry is running. Stop it before uninstalling.")
        raise typer.Exit(1)

    log_job_header("Uninstalling Registry", environment)

    if not typer.confirm("Delete all registry data?"):
        typer.echo("Cancelled.")
        return

    remove_directory(config.registry_home)

    log_job_footer("Uninstalled Registry")