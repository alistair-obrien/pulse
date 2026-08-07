# ============================================================================
# Base Configuration
# ============================================================================

from pulse_cli.common import context


from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class BaseConfig:

    environment: str

    service_name: str = field(init=False)

    @property
    def compose_file(self) -> Path:
        return "compose.yml"

    @property
    def pulse_home(self) -> Path:
        return context.PULSE_HOME / self.environment

    @property
    def service_home(self) -> Path:
        return self.pulse_home / self.service_name

    def compose_env(self) -> dict[str, str]:
        return {}