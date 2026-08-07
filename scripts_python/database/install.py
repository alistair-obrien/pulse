# >>> Database <<<
from pathlib import Path

import typer

from scripts_python.common import context
from scripts_python.common.log import log_job_footer, log_job_header
from scripts_python.database import app
from scripts_python.common.files import clean_install_directory, write_text
from .config import DatabaseConfig

@app.command()
def install(
    environment: str | None = typer.Argument(None),
):
    """Install a database to an environment."""

    environment = context.get_environment(environment)
    install_database(environment)

def install_database(environment_name:str) -> None:

    log_job_header("Installing Database", environment_name)

    config = DatabaseConfig(environment_name)

    clean_install_directory(
        config.database_home,
        [
            "config",
            "data",
        ],
    )

    write_database_config(config)

    log_job_footer("Installed Database")

def write_database_config(config: DatabaseConfig) -> None:

    postgres_env = f"""\
    POSTGRES_DB={config.postgres_db}
    POSTGRES_USER={config.postgres_user}
    POSTGRES_PASSWORD={config.postgres_password}
    """

    write_text(
        Path(config.postgres_env_file),
        postgres_env
    )
