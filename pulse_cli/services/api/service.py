from scripts_python.new_services.registry.service import Registry
from scripts_python.services.service import Service, Dependency
from scripts_python.services.service import NetworkDependency, PortDependency,  DockerImageDependency, ServiceDependency

from . import Config

class API(Service):

    def __init__(self, environment: str):
        self.config = Config(environment)

    def install(self):
        super()
        self.config.configure()

    @property
    def dependencies(self) -> list[Dependency]:
        return [
            PortDependency(self.config.host_port),
            NetworkDependency("pulse"), # TODO: Figure out how to get the top level network
            DockerImageDependency(),
            ServiceDependency(Registry)
        ]