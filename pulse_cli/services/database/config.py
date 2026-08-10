from dataclasses import dataclass, field
from pathlib import Path

from pulse_cli.services.base_config import BaseConfig

@dataclass
class Config(BaseConfig):

    remote: bool = False
    service_type = "postgres"

    @property
    def env_vars(self) -> dict[str,str]:
        return {
            "POSTGRES_DB": self.postgres_db_name,
            "POSTGRES_USER": self.postgres_user,
            "POSTGRES_PASSWORD": self.postgres_password,
        }

    @property
    def postgres_db_name(self) -> str: 
        return f"pulse_{self.environment}"

    @property
    def postgres_user(self) -> str:
        return "admin"

    @property
    def postgres_password(self) -> str:
        return "admin"

    @property
    def postgres_env_file(self) -> Path:
        return self.config_home / "postgres.env"

    def compose_env(self) -> dict[str, str]:
        config = Config(self.environment)

        return {
            "POSTGRES_DATA_DIR": str(config.data_home),
            "POSTGRES_ENV_FILE": str(config.postgres_env_file),
        }