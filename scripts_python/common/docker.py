import os
from pathlib import Path
import subprocess

def compose(
    environment: str,
    compose_file: Path,
    *args: str,
    capture_output: bool = False,
    **env_vars: str,
) -> subprocess.CompletedProcess:

    env = os.environ.copy()
    env["ENVIRONMENT"] = environment

    for k, v in env_vars.items():
        env[k] = str(v)

    cmd = [
        "docker",
        "compose",
        "-f", str(compose_file),
        "-p", environment,
        *args,
    ]

    return subprocess.run(
        cmd,
        env=env,
        check=True,
        text=True,
        capture_output=capture_output,
    )

def compose_up(
    environment: str,
    compose_file: Path,
    *services: str,
    **env_vars: str,
):
    compose(
        environment,
        compose_file,
        "up",
        "-d",
        *services,
        **env_vars,
    )


def compose_down(
    environment: str,
    compose_file: Path,
    **env_vars: str,
):
    compose(
        environment,
        compose_file,
        "down",
        **env_vars,
    )


def compose_restart(
    environment: str,
    compose_file: Path,
    *services: str,
    **env_vars: str,
):
    compose(
        environment,
        compose_file,
        "restart",
        *services,
        **env_vars,
    )

def compose_logs(
    environment: str,
    compose_file: Path,
    *services: str,
    follow: bool = True,
    tail: int = 100,
    **env_vars: str,
):
    args = ["logs", "--tail", str(tail)]

    if follow:
        args.append("-f")

    args.extend(services)

    compose(
        environment,
        compose_file,
        *args,
        **env_vars,
    )


def compose_running(
    environment: str,
    compose_file: Path,
    service: str,
    **env_vars: str,
) -> bool:
    result = compose(
        environment,
        compose_file,
        "ps",
        "-q",
        service,
        capture_output=True,
        **env_vars,
    )

    return bool(result.stdout.strip())