from abc import ABC, abstractmethod
from pathlib import Path

from .base_config import BaseConfig

import typer

# ============================================================================
# Base Service
# ============================================================================

class BaseService(ABC):

    config: BaseConfig

    @property
    def service_name(self) -> str:
        return self.config.service_name

    @property
    def environment(self) -> str:
        return self.config.environment

    @property
    def compose_file(self) -> Path:
        return self.config.compose_file

    @property
    def service_home(self) -> Path:
        return self.config.service_home

    @property
    def config_home(self) -> Path:
        return self.config.service_home / "config"

    @property
    def data_home(self) -> Path:
        return self.config.service_home / "data"

    @property
    def logs_home(self) -> Path:
        return self.config.service_home / "logs"

    @property
    def backups_home(self) -> Path:
        return self.config.service_home / "backups"

    def compose_env(self) -> dict[str, str]:
        return self.config.compose_env()

    # ------------------------------------------------------------------------

    def install(self) -> None:

        install_directory_tree(self.config.service_home)
        install_directory_tree(self.config.config_home)
        install_directory_tree(self.config.data_home)
        install_directory_tree(self.config.logs_home)
        install_directory_tree(self.config.backup_home)

    def uninstall(self) -> None:

        unintall_directory_tree(self.config.service_home)

    # ------------------------------------------------------------------------

    def start(self) -> None:

        docker.compose_up(
            self.environment,
            self.compose_file,
            **self.compose_env(),
        )

        log_info(
            f"Started '{self.service_name}' for '{self.environment}'."
        )

    def stop(self) -> None:

        docker.compose_down(
            self.environment,
            self.compose_file,
            **self.compose_env(),
        )

        log_info(
            f"Stopped '{self.service_name}' for '{self.environment}'."
        )

    # ------------------------------------------------------------------------

    def status(self) -> str:

        if not self.service_home.exists():
            return "Not installed"

        running = docker.compose_running(
            self.environment,
            self.compose_file,
            self.service_name,
            **self.compose_env(),
        )

        state = "Running" if running else "Stopped"

        return f"Local ({state})"

    def logs(self) -> None:

        docker.compose_logs(
            self.environment,
            self.compose_file,
            **self.compose_env(),
        )


# ============================================================================
# Environment
# ============================================================================

class Environment:

    def __init__(self, name: str):

        self.name = name
        self.services: list[BaseService] = []

    @property
    def root(self) -> Path:
        return context.PULSE_HOME / self.name

    # ------------------------------------------------------------------------

    def install(self) -> None:

        if self.root.exists():
            typer.echo(
                f"Environment '{self.name}' is already installed."
            )
            raise typer.Exit(1)

        self.root.mkdir(parents=True)

        docker.create_network(f"{self.name}_network")

        log_info(f"Created environment '{self.name}'.")

    def uninstall(self) -> None:
        pass

    # ------------------------------------------------------------------------

    def register(self, service: BaseService) -> None:
        self.services.append(service)

    # ------------------------------------------------------------------------

    def start(self) -> None:

        for service in self.services:
            service.start()

    def stop(self) -> None:

        for service in reversed(self.services):
            service.stop()

    # ------------------------------------------------------------------------

    def status(self) -> None:

        for service in self.services:
            typer.echo(
                f"{service.service_name}: {service.status()}"
            )

    def logs(self) -> None:

        for service in self.services:
            service.logs()


class HealthIssue:
    pass

class Dependency(ABC):

    @abstractmethod
    def check(self) -> HealthIssue | None:
        ...

class ServiceDependency(Dependency):

    def __init__(type:Database):
        pass

    def check(self) -> HealthIssue | None:
        return super().check()

class DockerImageDependency(Dependency):

    def __init__(service:type):
        pass

    def check(self) -> HealthIssue | None:
        return super().check()

class FileDependency(Dependency):
    def __init__(file:Path):
        pass

    def check(self) -> HealthIssue | None:
        return super().check()

class CertificateDependency(Dependency):
    def __init__(certificate:str):
        pass

    def check(self) -> HealthIssue | None:
        return super().check()

class PortDependency(Dependency):
    def __init__(port:int):
        pass

    def check(self) -> HealthIssue | None:
        return super().check()

class NetworkDependency(Dependency):
    def __init__(network:str):
        pass

    def check(self) -> HealthIssue | None:
        return super().check()




# ServiceDependency(Database)
# DockerImageDependency("pulse-api")
# FileDependency("/etc/pulse/config")
# CertificateDependency("pulse-flow")
# PortDependency(443)
# NetworkDependency("development_network")