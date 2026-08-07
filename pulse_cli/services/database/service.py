from dataclasses import dataclass, field
from pathlib import Path

from scripts_python.common.files import write_env_file
from scripts_python.services.service import Dependency, NetworkDependency, PortDependency, Service

from . import Config

class Database(Service):

    def __init__(self, environment: str):
        self.config = Config(environment)

    def install(self):
        super()
        write_env_file(self.config.postgres_env_file, self.config.env_vars)

    @property
    def dependencies(self) -> list[Dependency]:
        return [
            PortDependency(self.config.host_port),
            NetworkDependency("pulse") # TODO: Figure out how to get the top level network
        ]