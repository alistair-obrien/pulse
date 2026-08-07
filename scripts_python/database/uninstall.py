import typer
from scripts_python.common import context, docker
from scripts_python.common.files import remove_directory
from scripts_python.common.log import log_job_footer, log_job_header, log_warning
from . import app

from .config import DatabaseConfig

@app.command()
def uninstall(
    environment: str | None = typer.Argument(None),
):
    """Uninstall the database."""

    environment = context.get_environment(environment)

    config = DatabaseConfig(environment)

    if not config.database_home.exists():
        log_warning("Database is not installed.")
        return

    if docker.compose_running(
        environment,
        config.compose_file,
        "database",
        **config.compose_env,
    ):
        log_warning("Database is running. Stop it before uninstalling.")
        raise typer.Exit(1)

    log_job_header("Uninstalling Database", environment)

    if not typer.confirm("Delete all Database data?"):
        typer.echo("Cancelled.")
        return

    remove_directory(config.database_home)

    log_job_footer("Uninstalled Database")