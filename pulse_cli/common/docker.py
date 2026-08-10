import json
import os
import subprocess
from dataclasses import dataclass
from pathlib import Path

from .log import fmt_ntw, log_error, log_info

@dataclass
class ContainerStatus:

    exists: bool
    running: bool
    status: str
    health: str | None = None
    exit_code: int | None = None

# ============================================================================
# Compose
# ============================================================================

def compose(
    compose_file: Path,
    *args: str,
    capture_output: bool = False,
    check: bool = True,
    **env_vars: str,
) -> subprocess.CompletedProcess:

    env = os.environ.copy()

    for key, value in env_vars.items():
        env[key] = str(value)

    cmd = [
        "docker",
        "compose",
        "-f",
        str(compose_file),
        *args,
    ]

    return subprocess.run(
        cmd,
        env=env,
        check=check,
        text=True,
        capture_output=capture_output,
    )


# ============================================================================
# Compose Lifecycle
# ============================================================================

def compose_up(
    compose_file: Path,
    *services: str,
    **env_vars: str,
) -> None:

    compose(
        compose_file,
        "up",
        "-d",
        *services,
        **env_vars,
    )


def compose_down(
    compose_file: Path,
    **env_vars: str,
) -> None:

    compose(
        compose_file,
        "down",
        **env_vars,
    )


def compose_restart(
    compose_file: Path,
    *services: str,
    **env_vars: str,
) -> None:

    compose(
        compose_file,
        "restart",
        *services,
        **env_vars,
    )


# ============================================================================
# Compose Logs
# ============================================================================

def compose_logs(
    compose_file: Path,
    *services: str,
    follow: bool = True,
    tail: int = 100,
    **env_vars: str,
) -> None:

    args = [
        "logs",
        "--tail",
        str(tail),
    ]

    if follow:
        args.append("-f")

    args.extend(services)

    compose(
        compose_file,
        *args,
        **env_vars,
    )


# ============================================================================
# Compose Status
# ============================================================================

@dataclass
class ComposeContainer:

    name: str
    service: str
    state: str
    status: str
    health: str | None = None
    exit_code: int | None = None


def compose_ps(
    compose_file: Path,
    **env_vars: str,
) -> list[ComposeContainer]:

    result = compose(
        compose_file,
        "ps",
        "-a",
        "--format",
        "json",
        capture_output=True,
        check=False,
        **env_vars,
    )

    if result.returncode != 0:

        if result.stderr.strip():
            log_error(
                result.stderr.strip()
            )

        return []

    if not result.stdout.strip():
        return []

    containers: list[ComposeContainer] = []

    for line in result.stdout.splitlines():

        line = line.strip()

        if not line:
            continue

        try:
            container = json.loads(line)

        except json.JSONDecodeError as e:

            log_error(
                f"Could not parse Docker Compose status: "
                f"{e}"
            )

            continue

        containers.append(
            ComposeContainer(
                name=container.get("Name", ""),
                service=container.get("Service", ""),
                state=container.get("State", ""),
                status=container.get("Status", ""),
                health=container.get("Health"),
                exit_code=container.get("ExitCode"),
            )
        )

    return containers

def compose_running(
    compose_file: Path,
    **env_vars: str,
) -> bool:

    containers = compose_ps(
        compose_file,
        **env_vars,
    )

    return any(
        container.state == "running"
        for container in containers
    )


# ============================================================================
# Docker Networks
# ============================================================================

def add_network(
    network_name: str,
) -> None:

    try:

        result = subprocess.run(
            [
                "docker",
                "network",
                "create",
                network_name,
            ],
            check=True,
            capture_output=True,
            text=True,
        )

        log_info(
            f"Added network "
            f"{fmt_ntw(network_name)}"
        )

        if result.stdout.strip():

            log_info(
                result.stdout.strip()
            )

    except subprocess.CalledProcessError as e:

        log_error(
            f"Could not add network "
            f"{fmt_ntw(network_name)}"
        )

        if e.stderr:

            log_error(
                e.stderr.strip()
            )


def remove_network(
    network_name: str,
) -> None:

    try:

        result = subprocess.run(
            [
                "docker",
                "network",
                "rm",
                network_name,
            ],
            check=True,
            capture_output=True,
            text=True,
        )

        log_info(
            f"Removed network "
            f"{fmt_ntw(network_name)}"
        )

        if result.stdout.strip():

            log_info(
                result.stdout.strip()
            )

    except subprocess.CalledProcessError as e:

        log_error(
            f"Could not remove network "
            f"{fmt_ntw(network_name)}"
        )

        if e.stderr:

            log_error(
                e.stderr.strip()
            )


def container_status(
    container_name: str,
) -> ContainerStatus:

    result = subprocess.run(
        [
            "docker",
            "inspect",
            container_name,
        ],
        capture_output=True,
        text=True,
        check=False,
    )

    if result.returncode != 0:
        return ContainerStatus(
            exists=False,
            running=False,
            status="Not Created",
        )

    try:
        data = json.loads(result.stdout)

        container = data[0]
        state = container["State"]

    except (
        json.JSONDecodeError,
        IndexError,
        KeyError,
        TypeError,
    ):
        return ContainerStatus(
            exists=False,
            running=False,
            status="Unknown",
        )

    return ContainerStatus(
        exists=True,
        running=state.get("Running", False),
        status=state.get("Status", "Unknown"),
        health=(
            state.get("Health", {})
            .get("Status")
        ),
        exit_code=state.get("ExitCode"),
    )

def container_logs(
    container_name: str,
    follow: bool = True,
    tail: int = 100,
) -> None:

    args = [
        "docker",
        "logs",
        "--tail",
        str(tail),
    ]

    if follow:
        args.append("--follow")

    args.append(container_name)

    subprocess.run(
        args,
        check=False,
    )

def container_inspect(
    container_name: str,
) -> None:

    subprocess.run(
        [
            "docker",
            "inspect",
            container_name,
        ],
        check=False,
    )