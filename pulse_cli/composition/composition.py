from dataclasses import dataclass
import shutil
from pathlib import Path

from dataclasses import dataclass

import yaml

from pulse_cli.services import registered_service_types
from pulse_cli.common import docker
from pulse_cli.common.files import write_config_file
from pulse_cli.common.log import (
    fmt_cmp,
    fmt_svc,
    log_error,
    log_info,
    log_job_footer,
    log_job_header,
    log_space,
    log_title,
    log_warning,
)
from pulse_cli.env import PULSE_HOME
from pulse_cli.services.base_service import BaseService

from pulse_cli.services.api.service import Service as ApiService
from pulse_cli.services.database.service import Service as PostgresService
from pulse_cli.services.nginx.service import Service as NginxService
from pulse_cli.services.registry.service import Service as RegistryService

def write_compose_file(
    path: Path,
    compose: dict,
) -> None:

    path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with path.open(
        "w",
        encoding="utf-8",
    ) as file:

        yaml.safe_dump(
            compose,
            file,
            default_flow_style=False,
            sort_keys=False,
        )

@dataclass
class ServiceDef:

    service_type:str
    service_name:str

# ======================================================================
# Composition
# ======================================================================

class Composition:

    def __init__(self, environment: str, name: str):

        self.environment = environment
        self.name = name

        self.selected_service: BaseService | None = None

    # ==================================================================
    # Properties
    # ==================================================================

    @property
    def formatted_name(self) -> str:
        return fmt_cmp(self.name)

    @property
    def root_path(self) -> Path:

        return PULSE_HOME / self.environment / self.name

    @property
    def compose_project_name(self) -> str:
        return f"{self.environment}-{self.name}"

    @property
    def services_path(self) -> Path:

        return self.root_path / "services"

    @property
    def compose_file(self) -> Path:
        return self.root_path / "compose.yml"

    # ==================================================================
    # Context
    # ==================================================================
    def get_context(self) -> list[str]:
        context = []

        context.append(fmt_cmp(self.name))

        if (self.selected_service):
            context.extend(self.selected_service.get_context())

        return context 

    def status_string(self) -> str:

        containers = docker.compose_ps(
            self.compose_file,
        )

        if not containers:
            return "Not Created"

        running = [
            container
            for container in containers
            if container.state == "running"
        ]

        if len(running) == len(containers):
            return "Running"

        if running:
            return "Degraded"

        return "Stopped"

    # ==================================================================
    # Lifecycle
    # ==================================================================

    def install(self) -> None:

        if self.root_path.exists():

            log_error(
                f"Composition "
                f"{fmt_cmp(self.name)} "
                f"is already installed."
            )

            return

        log_job_header(
            f"Creating Composition "
            f"{fmt_cmp(self.name)}"
        )

        self.root_path.mkdir(
            parents=True,
            exist_ok=False,
        )

        write_config_file(
            self.root_path / "composition.config",
            {
                "Hello": "Hi",
            },
        )

        log_job_footer(
            f"Created Composition "
            f"{fmt_cmp(self.name)}"
        )

    def uninstall(self) -> None:

        if not self.root_path.exists():

            log_error(
                f"Composition "
                f"{fmt_cmp(self.name)} "
                f"does not exist."
            )

            return

        shutil.rmtree(
            self.root_path
        )

        log_info(
            f"Removed Composition "
            f"{fmt_cmp(self.name)}."
        )

    # ==================================================================
    # Configuration
    # ==================================================================

    def configure(self) -> None:

        values: dict[str, str] = {}

        values["RESTART"] = input(
            "Restart: "
        ) # unless-stopped

        write_config_file(
            self.root_path / "comp.config",
            values,
        )

        log_info(
            f"Configured compostion "
            f"{fmt_cmp(self.name)}"
        )

    # ==================================================================
    # Services
    # ==================================================================
    def available_services(self) -> list[ServiceDef]:

        if not self.services_path.exists():
            return []

        services: list[ServiceDef] = []

        for service_type_path in self.services_path.iterdir():

            if not service_type_path.is_dir():
                continue

            for service_path in service_type_path.iterdir():

                if not service_path.is_dir():
                    continue

                services.append(
                    ServiceDef(
                        service_type=service_type_path.name,
                        service_name=service_path.name,
                    )
                )

        return sorted(
            services,
            key=lambda service: (
                service.service_type,
                service.service_name,
            ),
        )

    # ==================================================================
    # Services
    # ==================================================================

    def make_service_wrapper(self, service_def:ServiceDef) -> BaseService:
        service_class = registered_service_types.get(service_def.service_type)

        if service_class is None:

            log_error(
                f"Unknown service type: "
                f"{fmt_svc(service_def.service_type)}"
            )

            return

        service = service_class(
            environment=self.environment,
            composition=self.name,
            name=service_def.service_name
        )

        return service

    def create_service(
        self,
        service_type: str,
        name: str,
    ) -> None:

        service_def = ServiceDef(
            service_type=service_type,
            service_name=name,
        )

        if service_def in self.available_services():
            log_error(
                f"Service "
                f"{fmt_svc(service_type)}:{fmt_svc(name)} "
                f"already exists."
            )
            return

        self.make_service_wrapper(service_def).install()

    def delete_service(
        self,
        service_type: str,
        name: str,
    ) -> None:

        service_def = ServiceDef(
            service_type=service_type,
            service_name=name,
        )

        if not service_def in self.available_services():
            log_error(
                f"Service "
                f"{fmt_svc(service_type)}:{fmt_svc(name)} "
                f"does not exist."
            )
            return

        self.make_service_wrapper(service_def).uninstall()

    def list_services(self) -> None:

        services = self.available_services()

        if not services:

            log_warning(
                "No services found."
            )

            return

        log_title("Services")

        for service in services:
            service_shell = self.make_service_wrapper(service)
            log_info(f"{service_shell.service_name_formatted} | {service_shell.status_string()}")

    def select_service(
        self,
        service_fullname:str,
    ) -> None:

        parts = service_fullname.split('.')

        if len(parts) != 2:
            log_error(f"Invalid format for service identifier: {service_fullname}")
            log_error(f"Expected Format: service_type:service_name")
            return

        #split by :

        service_type = parts[0]
        service_name = parts[1]

        service_def = ServiceDef(
            service_type=service_type,
            service_name=service_name,
        )

        if service_def not in self.available_services():
            log_error(
                f"Service "
                f"{service_type}.{service_name} "
                f"does not exist."
            )
            return

        self.selected_service = self.make_service_wrapper(service_def)

        log_info(
            f"Selected service: "
            f"{self.selected_service.service_name_formatted}"
        )

        self.log_context()

    # ==================================================================
    # Commands
    # ==================================================================

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

        if self.selected_service:

            if command == "x":

                previous = self.selected_service

                self.selected_service = None

                log_info(
                    f"Closed service "
                    f"{fmt_svc(previous.service_name)}"
                )

                return

            self.selected_service.execute(
                argv
            )

            return

        # --------------------------------------------------------------
        # Environment context
        # --------------------------------------------------------------

        match command:

            case "cfg":

                self.configure()

            case "ls":

                self.list_services()

            case "mk":

                if len(args) != 2:

                    log_error(
                        "Usage: "
                        "mk <service_type> <service_name>"
                    )

                    return

                self.create_service(
                    args[0],
                    args[1],
                )

            case "rm":

                if len(args) != 1:

                    log_error(
                        "Usage: rm <service_name>"
                    )

                    return

                self.delete_service(
                    args[0]
                )

            case "sel":

                if len(args) != 1:

                    log_error(
                        "Usage: sel <service_type>:<service_name>"
                    )

                    return

                self.select_service(
                    args[0]
                )

            case "t":

                self.start()

            case "p":

                self.stop()

            case "r":

                self.restart()

            case "status":

                self.status()

            case "logs":

                self.logs()

            case _:

                log_error(
                    f"Unknown Command: {command}"
                )

    # ==================================================================
    # View
    # ==================================================================

    def log_context(self) -> None:

        if self.selected_service:
            self.selected_service.log_context()
                        
        else:
            self.list_services()


    def log_help(self) -> None:

        if self.selected_service:

            log_info("x          Close Service")
            self.selected_service.log_help()
            return

        log_info("t          Start Composition")

        log_info("p          Stop Composition")

        log_info("r          Restart Composition")

        log_info("cfg        Configure Composition")

        log_info("ls         List Services")

        log_info("sel        Select a Service")

        log_info("mk         Make a new Service")

        log_info("rm         Delete a Service")

        log_info("status     Show Status")

        log_info("logs       Show Logs")

    def start(self) -> None:

        self.compose()

        if docker.compose_running(self.compose_file):            
            log_info(f"{fmt_svc(self.name)} is running.")
            return

        docker.compose_up(self.compose_file)

        log_info(
            f"Started "
            f"'{self.name}' composition "
            f"in '{self.environment}'."
        )

    def stop(self) -> None:
        if not docker.compose_running(self.compose_file):            
            log_info(f"{fmt_svc(self.name)} is not running.")
            return

        docker.compose_down(self.compose_file)

        log_info(
            f"Stopped "
            f"'{self.name}' Composition"
            f"in '{self.environment}'."
        )

    
    def restart(self) -> None:

        docker.compose_restart(self.compose_file)

    def status(self) -> None:

        containers = docker.compose_ps(
            self.compose_file,
        )

        if not containers:
            log_warning("No containers found.")
            return

        log_title(
            f"{fmt_cmp(self.name)} Status"
        )

        for container in containers:

            log_info(
                f"{fmt_svc(container.service)}    "
                f"{container.status}"
            )

    def logs(self) -> None:
        for service_def in self.available_services():
            self.make_service_wrapper(service_def).logs()

    def compose(self) -> None:

        compose = {
            "services": {},
            "networks": {},
        }

        for service_def in self.available_services():

            service = self.make_service_wrapper(
                service_def
            )

            definition = service.get_compose_definition()

            compose["services"][service.name] = (
                definition.to_dict(service.container_name)
            )

        write_compose_file(
            self.compose_file,
            compose,
        )

    def open_bash(self) -> None:
        pass