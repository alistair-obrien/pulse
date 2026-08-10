from pulse_cli.composition.compose_definition import ComposeDefinition
from pulse_cli.services.base_dependency import BaseDependency, DockerImageDependency, NetworkDependency, PortDependency, ServiceDependency
from pulse_cli.services.base_service import BaseService

from .config import Config

class Service(BaseService):
    service_type = "api"

    def __init__(self, environment: str, name: str):
        self.name = name
        self.config = Config(environment)

    def install(self):
        super()
        self.config.configure()

    @property
    def dependencies(self) -> list[BaseDependency]:
        return [
            PortDependency(self.config.host_port),
            NetworkDependency("pulse"), # TODO: Figure out how to get the top level network
            DockerImageDependency(),
            ServiceDependency("registry")
        ]

    def get_compose_definition(self) -> ComposeDefinition:

        # TODO: Config can decide which registry to use
        # Then we can build it up from there
        registry_string = "TODO"
        image_string = f"{self.service_type}_{self.name}_api:latest"
        image_full_id = f"{registry_string}:{image_string}"

        return ComposeDefinition(
            image=image_full_id,

            restart="unless-stopped",

            # env_file:
                # - self.config.env_file

            volumes=[
                f"{self.config.config_home.as_posix()}:/etc/pulse",
            ],

            # networks=[
            #     f"{self.config.environment}_network"
            # ],
        )


# services:

#   api:
#     image: ${REGISTRY_HOST}:${REGISTRY_PORT}/${API_IMAGE}
#     restart: unless-stopped
#     env_file:
#       - ${DOTNET_ENV_FILE}
#     volumes:
#       - ${CONFIG_DIR}:/etc/pulse
#     networks:
#       - default