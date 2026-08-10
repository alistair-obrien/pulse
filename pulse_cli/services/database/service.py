from pulse_cli.common.files import write_config_file
from pulse_cli.composition.compose_definition import ComposeDefinition
from pulse_cli.services.base_dependency import BaseDependency, NetworkDependency, PortDependency 
from pulse_cli.services.base_service import BaseService

from .config import Config

class Service(BaseService):
    service_type = "database"
    
    def __init__(
            self, 
            environment: str, 
            composition: str,
            name: str):
        super().__init__(name)
        self.config = Config(environment, composition, name)

    def install(self):
        super()
        write_config_file(self.config.postgres_env_file, self.config.env_vars)

    @property
    def dependencies(self) -> list[BaseDependency]:
        return [
            PortDependency(self.config.host_port),
            NetworkDependency("pulse") # TODO: Figure out how to get the top level network
        ]

    def get_compose_definition(self) -> ComposeDefinition:

        return ComposeDefinition(
            image="postgres:17",

            restart="unless-stopped",

            volumes=[
                f"{self.config.data_home.as_posix()}:/var/lib/postgresql/data",
            ],

            # networks=[
            #     f"{self.config.environment}_network"
            # ],
        )

            # TODO: Send in the env file or explicit dict
#            environment=self.config.postgres_env_file,


#   database:
#     image: postgres:17
#     restart: unless-stopped

#     env_file:
#       - ${POSTGRES_ENV_FILE}

#     volumes:
#       - ${POSTGRES_DATA_DIR}:/var/lib/postgresql/data

#     networks:
#       - default