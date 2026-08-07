import os
import shlex
import subprocess

import typer
from pathlib import Path

from prompt_toolkit import prompt
from prompt_toolkit.history import FileHistory

from .services.base_service import BaseService
from .common import context

history = FileHistory("/var/lib/pulse/history")

pulse_app = typer.Typer(help="Manage Pulse environments.", no_args_is_help=True, short_help=True, add_completion=False, rich_help_panel=False)

services: list[BaseService] = []

from .services import *

for service in services:

@pulse_app.command()
def environments():
    """List installed environments."""

    if not context.PULSE_HOME.exists():
        typer.echo("No environments found.")
        raise typer.Exit()

    environments = sorted(
        p.name
        for p in context.PULSE_HOME.iterdir()
        if p.is_dir()
    )

    if not environments:
        typer.echo("No environments found.")
        raise typer.Exit()

    typer.echo("Environments:")
    for environment in environments:
        typer.echo(f"  • {environment}")

@pulse_app.command()
def select(
    environment: str = typer.Argument(..., help="Environment name"),
):
    """Select a working environment."""

    if environment.lower() == "none":
        context.set_working_environment(None)
    else:
        context.set_working_environment(environment)

if __name__ == "__main__":

    print(os.environ["PATH"])

    print(">>> Welcome to Pulse <<<")         

    try:
        pulse_app(args=["--help"])
    except SystemExit:
        pass

    try:
        pulse_app(args=["environments"])
    except SystemExit:
        pass

    while True:

        working_environment = context.working_environment()

        if working_environment:
            prompt_text = f"pulse [{working_environment}]: "
        else:
            prompt_text = f"pulse: "

        try:
            command = prompt(prompt_text, history=history)
        except KeyboardInterrupt:
            print()
            continue
        except EOFError:
            print()
            break

        if command in ("exit", "quit"):
            break

        if command == "clear":
            subprocess.run(["clear"])
            continue

        if not command:
            continue

        # if working_environment:
        #     command = f"environment {command}"

        argv = shlex.split(command)

        try:
            pulse_app(args=argv)
        except SystemExit:
            pass