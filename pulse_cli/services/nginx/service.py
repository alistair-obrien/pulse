from dataclasses import dataclass, field
from pathlib import Path

from scripts_python.common.files import install_directory_tree, write_text_to_file
from scripts_python.services.service import Dependency, NetworkDependency, PortDependency, Service

from . import Config

class NGINX(Service):

    def __init__(self, environment: str):
        self.config = Config(environment)