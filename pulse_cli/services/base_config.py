# ============================================================================
# Base Configuration
# ============================================================================

from dataclasses import dataclass
from pathlib import Path

from pulse_cli.root.root import PULSE_HOME


@dataclass
class BaseConfig:

    environment: str
    composition: str
    name: str

    @property
    def composition_home(self) -> Path:
        return PULSE_HOME / self.environment / self.composition

    @property
    def services_home(self) -> Path:
        return self.composition_home / "services"

    @property
    def service_home(self) -> Path:
        return self.services_home / self.service_type / self.name

    @property
    def config_home(self) -> Path:
        return self.service_home / "config"

    @property
    def data_home(self) -> Path:
        return self.service_home / "data"

    @property
    def logs_home(self) -> Path:
        return self.service_home / "logs"

    @property
    def backups_home(self) -> Path:
        return self.service_home / "backups"

    def compose_env(self) -> dict[str, str]:
        return {}