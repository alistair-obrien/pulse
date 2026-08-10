from pathlib import Path

from abc import ABC, abstractmethod

from pulse_cli.services.base_service import BaseService

class HealthIssue:
    pass

class BaseDependency(ABC):

    @abstractmethod
    def check(self) -> HealthIssue | None:
        ...


class ServiceDependency(BaseDependency):

    def __init__(service:str):
        pass

    def check(self) -> HealthIssue | None:
        return super().check()

class DockerImageDependency(BaseDependency):

    def __init__(image:str):
        pass

    def check(self) -> HealthIssue | None:
        return super().check()

class FileDependency(BaseDependency):
    def __init__(file:Path):
        pass

    def check(self) -> HealthIssue | None:
        return super().check()

class CertificateDependency(BaseDependency):
    def __init__(certificate:str):
        pass

    def check(self) -> HealthIssue | None:
        return super().check()

class PortDependency(BaseDependency):
    def __init__(port:int):
        pass

    def check(self) -> HealthIssue | None:
        return super().check()

class NetworkDependency(BaseDependency):
    def __init__(network:str):
        pass

    def check(self) -> HealthIssue | None:
        return super().check()