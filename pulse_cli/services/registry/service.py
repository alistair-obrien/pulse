import shutil
import subprocess

from pulse_cli.common.files import (
    install_directory_tree,
    write_text_to_file,
)
from pulse_cli.common.log import (
    log_error,
    log_info,
)
from pulse_cli.composition.compose_definition import ComposeDefinition
from pulse_cli.services.base_dependency import (
    BaseDependency,
    NetworkDependency,
    PortDependency,
)
from pulse_cli.services.base_service import BaseService

from .config import Config


class Service(BaseService):

    service_type = "registry"

    def __init__(
        self,
        environment: str,
        composition: str,
        name: str,
    ):

        super().__init__(name)
        self.config = Config(environment, composition, name)

    def log_context(self) -> None:
        log_info(f"Hello from {self.name}")

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    def install(self) -> None:

        super().install()

        install_directory_tree(
            self.config.auth_home
        )

        install_directory_tree(
            self.config.certs_home
        )

        self.write_registry_config()

        # TODO: need to actually start registry which will prompt for PW
        self.ensure_htpasswd()

        log_info(
            f"Installed '{self.name}' "
            f"for '{self.config.environment}'."
        )

    def uninstall(self) -> None:

        super().uninstall()

        log_info(
            f"Uninstalled '{self.name}' "
            f"for '{self.config.environment}'."
        )

    # ------------------------------------------------------------------
    # Dependencies
    # ------------------------------------------------------------------

    @property
    def dependencies(self) -> list[BaseDependency]:

        return [
            NetworkDependency(
                f"{self.config.environment}_{self.config.composition}_network"
            ),
        ]

    # ------------------------------------------------------------------
    # Configuration
    # ------------------------------------------------------------------

    def write_registry_config(self) -> None:

        config = f"""\
version: 0.1

http:
  addr: :5000
  auth:
    htpasswd:
      realm: Pulse {self.config.environment} Registry
      path: {self.config.htpasswd}

storage:
  filesystem:
    rootdirectory: /var/lib/registry
"""

        write_text_to_file(
            self.config.config_file,
            config,
        )

        log_info(
            "Wrote registry configuration."
        )

    def ensure_htpasswd(self) -> None:

        if self.config.htpasswd.exists():
            return

        if shutil.which("htpasswd") is None:

            log_error(
                "htpasswd is not installed."
            )

            return

        username = input("Registry Username: ")

        result = subprocess.run(
            [
                "htpasswd",
                "-Bc",
                str(self.config.htpasswd),
                username,
            ],
            check=False,
        )

        if result.returncode != 0:

            log_error(
                "Failed to create registry authentication credentials."
            )

            return

        log_info(
            "Created registry authentication credentials."
        )

    def get_compose_definition(self) -> ComposeDefinition:

        return ComposeDefinition(
            image="registry:3",

            restart="unless-stopped",

            volumes=[
                f"{self.config.config_home.as_posix()}:/etc/docker/registry:ro",
                f"{self.config.data_home.as_posix()}:/var/lib/registry",
            ],

            # networks=[
            #     f"{self.config.environment}_network"
            # ],
        )




# services:
#   registry:
#     image: registry:3
#     restart: unless-stopped
#     volumes:
#       - ${REGISTRY_CONFIG_DIR}:/etc/docker/registry:ro
#       - ${REGISTRY_DATA_DIR}:/var/lib/registry/
#     # ports:
#     #   - "${HOST_PORT}:${CONTAINER_PORT}"
#     networks:
#       - default

#     healthcheck:
#       test: ["CMD", "wget", "--spider", "-q", "http://localhost:${CONTAINER_PORT}/v2/"]
#       interval: 2s
#       timeout: 2s
#       retries: 15