from dataclasses import dataclass, field
from pathlib import Path

from scripts_python.services.base_config import BaseConfig

@dataclass
class Config(BaseConfig):

    service_name: str = field(default="database", init=False)

    remote: bool = False

    @property
    def env_vars(self) -> dict[str,str]:
        return {
            "POSTGRES_DB": self.config.postgres_db_name,
            "POSTGRES_USER": self.config.postgres_user,
            "POSTGRES_PASSWORD": self.config.postgres_password,
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
        return self.config_dir / "postgres.env"

    def compose_env(self) -> dict[str, str]:
        config = Config(self.environment)

        return {
            "POSTGRES_DATA_DIR": str(config.data_dir),
            "POSTGRES_ENV_FILE": str(config.postgres_env_file),
        }