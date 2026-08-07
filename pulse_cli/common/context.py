from pathlib import Path

import typer


PULSE_HOME = Path("/var/lib/pulse")

_working_environment: str | None = None

def working_environment() -> str | None:
    return _working_environment

def get_environment(environment: str | None = None) -> str:
    name = environment or _working_environment

    if not name:
        typer.echo(
            "No environment selected. Use 'select <environment>' or specify one.",
            err=True,
        )
        raise typer.Exit(code=1)

    if not environment_exists(name):
        typer.echo(
            f"Environment '{name}' does not exist.",
            err=True,
        )
        raise typer.Exit(code=1)

    return name

def set_working_environment(environment: str | None):
    global _working_environment

    if environment is None:
        _working_environment = None
        return

    if not environment_exists(environment):
        typer.echo(f"Environment '{environment}' does not exist.", err=True)
        raise typer.Exit(1)

    _working_environment = environment

def environment_exists(environment: str | None) -> bool:
    if not environment: return False
    root = environment_root(environment)
    return root.exists()

def environment_root(environment: str) -> Path:
    return PULSE_HOME / environment

def component_root(environment: str, component: str) -> Path:
    return environment_root(environment) / component

def component_status(environment: str, name: str) -> str:
    root = component_root(environment, name)

    if not root.exists():
        return "Not installed"

    if (root / "external").exists():
        return "External"

    return "Internal"