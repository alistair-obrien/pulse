from abc import ABC
from dataclasses import dataclass
from typing import ClassVar

from pulse_cli.common import docker
from pulse_cli.common.files import (
    install_directory_tree,
    uninstall_directory_tree,
)
from pulse_cli.common.log import (
    fmt_cmp,
    fmt_env,
    fmt_svc,
    log_error,
    log_info,
    log_warning,
)

from pulse_cli.composition.compose_definition import ComposeDefinition

from .base_config import BaseConfig


# ============================================================================
# Service Status
# ============================================================================

@dataclass
class ServiceStatus:

    installed: bool
    running: bool
    healthy: bool
    issues: list[str]


# ============================================================================
# Base Service
# ============================================================================

class BaseService(ABC):

    service_type: ClassVar[str]

    config: BaseConfig

    def __init__(self, name: str):

        self.name = name

    @property
    def service_name(self):
        return f"{self.service_type}.{self.config.name}"

    @property
    def service_name_formatted(self) -> str:
        return fmt_svc(self.service_name)

    @property
    def container_name(self) -> str:
        return (
            f"{self.config.environment}-"
            f"{self.config.composition}-"
            f"{self.service_name}"
        )

    @property
    def container_name_formatted(self) -> str:
        return (
            f"{fmt_env(self.config.environment)}-"
            f"{fmt_cmp(self.config.composition)}-"
            f"{self.service_name_formatted}"
        )

    # ========================================================================
    # Lifecycle
    # ========================================================================

    def install(self) -> None:

        install_directory_tree(
            self.config.service_home
        )

        install_directory_tree(
            self.config.config_home
        )

        install_directory_tree(
            self.config.data_home
        )

        install_directory_tree(
            self.config.logs_home
        )

        install_directory_tree(
            self.config.backups_home
        )

        log_info(
            f"Installed "
            f"'{self.service_type}' "
            f"for '{self.config.environment}'."
        )

    def uninstall(self) -> None:

        uninstall_directory_tree(
            self.config.service_home
        )

        log_info(
            f"Uninstalled "
            f"'{self.name}' "
            f"from '{self.config.environment}'."
        )

    # ========================================================================
    # Runtime
    # ========================================================================


    def log_context(self) -> None:
        log_info("Service Context?")

        
    def log_help(self) -> None:
        log_info("c          Configure Service")

        log_info("s          Show Container Status")

        log_info("l          Show Container Logs")

        log_info("i          Inspect Container")

    def execute(
        self,
        argv: list[str],
    ) -> None:

        if not argv:
            return

        command = argv[0]
        args = argv[1:]

        # --------------------------------------------------------------
        # Service context
        # --------------------------------------------------------------

        match command:

            case "c":
                self.configure()

            case "s":
                self.print_status()

            case "l":
                self.logs()

            case "i":
                self.inspect()

            case _:

                log_error(
                    f"Unknown Command: {command}"
                )

    # ==================================================================
    # Context
    # ==================================================================
    def get_context(self) -> list[str]:
        context = []

        context.append(self.service_name_formatted)

        return context 

    # ========================================================================
    # Status
    # ========================================================================

    def status_string(self) -> str:

        status = docker.container_status(
            self.container_name,
        )

        if not status.exists:
            return "Not Created"

        if status.health:
            return (
                f"{status.status} "
                f"({status.health})"
            )

        return status.status

    def print_status(self) -> None:
        log_info(self.status_string())


    # ========================================================================
    # Logs
    # ========================================================================

    def logs(self) -> None:

        docker.container_logs(
            container_name=self.container_name,
            follow=True,
            tail=100
        )

    def inspect(self) -> None:

        docker.container_inspect(
            container_name=self.container_name
        )

    def get_compose_definition(self) -> ComposeDefinition:
        raise NotImplementedError