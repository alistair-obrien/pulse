from dataclasses import dataclass
from pathlib import Path
import shutil
import subprocess
from scripts_python.common.files import clean_install_directory, write_text
from scripts_python.common.log import log_job_header, log_job_footer, log_task_footer, log_task_header, log_warning

import typer
from scripts_python.common import context
from scripts_python.registry.config import RegistryConfig
from . import app

@app.command()
def install(
    environment: str | None = typer.Argument(None),
):
    """Install a registry to an environment."""
    
    environment = context.get_environment(environment)
    install_registry(environment)


def install_registry(environment_name: str):

    log_job_header("Installing Registry", environment_name)
    
    config = RegistryConfig(environment_name)

    clean_install_directory(
        config.registry_home,
        [
            "config",
            "config/auth",
            "config/certs",
            "data",
        ],
    )

    write_registry_config(config)
    ensure_htpasswd(config)

    log_job_footer("Installed Registry")


def write_registry_config(config:RegistryConfig):

    yaml:list[str] = [];
    
    yaml = f"""\
    version: 0.1

    http:
    addr: :5000
    auth:
        htpasswd:
        realm: Pulse {config.environment_name} Registry
        path: {config.htpasswd}

    storage:
    filesystem:
        rootdirectory: /var/lib/registry
    """

    write_text(
        Path(config.config_file),
        yaml,
    )

def ensure_htpasswd(config: RegistryConfig):
    if config.htpasswd.exists():
        return

    if shutil.which("htpasswd") is None:
        raise RuntimeError("htpasswd is not installed.")

    username = input("Registry username: ")

    subprocess.run(
        [
            "htpasswd",
            "-Bc",
            str(config.htpasswd),
            username,
        ],
        check=True,
    )