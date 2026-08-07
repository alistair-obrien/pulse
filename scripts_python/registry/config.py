from dataclasses import dataclass
from pathlib import Path
from scripts_python.common import context

@dataclass
class RegistryConfig:

    environment_name: str

    compose_file: str = Path(__file__).with_name("compose.yml")

    @property
    def pulse_home(self) -> Path:
        return context.PULSE_HOME / self.environment_name

    @property
    def registry_home(self) -> Path:
        return self.pulse_home / "registry"

    @property
    def config_dir(self) -> Path:
        return self.registry_home / "config"

    @property
    def auth_dir(self) -> Path:
        return self.config_dir / "auth"

    @property
    def certs_dir(self) -> Path:
        return self.config_dir / "certs"

    @property
    def data_dir(self) -> Path:
        return self.registry_home / "data"

    @property
    def htpasswd(self) -> Path:
        return self.auth_dir / "htpasswd"

    @property
    def registry_port(self) -> str:
        return "5100"

    @property
    def config_file(self) -> Path:
        return self.config_dir / "config.yml"

    def compose_env(self) -> dict[str, str]:
        return {
            "REGISTRY_CONFIG_DIR": self.config_dir,
            "REGISTRY_DATA_DIR": self.data_dir,
            "REGISTRY_PORT": self.registry_port,
        }