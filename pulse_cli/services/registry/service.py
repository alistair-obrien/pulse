from pathlib import Path
import shutil
import subprocess

from scripts_python.common.files import install_directory_tree, write_text_to_file

from scripts_python.services.service import Dependency, NetworkDependency, PortDependency, Service
from . import Config

class Registry(Service):

    def __init__(self, environment: str):
        self.config = Config(environment)

    def install(self):
        super()

        install_directory_tree(self.config.auth_home)
        install_directory_tree(self.config.certs_home)

        self.write_registry_config(self.config)
        self.ensure_htpasswd(self.config)

    def uninstall(self):
        super()

    def configure(self):
        super()

    @property
    def dependencies(self) -> list[Dependency]:
        return [
            PortDependency(self.config.host_port),
            NetworkDependency("pulse") # TODO: Figure out how to get the top level network
        ]

    def write_registry_config(self):

        yaml:list[str] = [];
        
        yaml = f"""\
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
            Path(self.config.config_file),
            yaml,
        )

    def ensure_htpasswd(self):
        if self.config.htpasswd.exists():
            return

        if shutil.which("htpasswd") is None:
            raise RuntimeError("htpasswd is not installed.")

        username = input("Registry username: ")

        subprocess.run(
            [
                "htpasswd",
                "-Bc",
                str(self.config.htpasswd),
                username,
            ],
            check=True,
        )