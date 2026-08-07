from dataclasses import dataclass
from pathlib import Path
from scripts_python.common import context

@dataclass
class DatabaseConfig:

    environment_name: str

    compose_file: str = Path(__file__).with_name("compose.yml")

    remote: bool = False

    @property
    def postgres_db(self) -> str: 
        return f"pulse_{self.environment_name}"

    @property
    def postgres_user(self) -> str:
        return "admin"

    @property
    def postgres_password(self) -> str:
        return ""
    
    @property
    def pulse_home(self) -> Path:
        return context.PULSE_HOME / self.environment_name

    @property
    def database_home(self) -> Path:
        return self.pulse_home / "database"

    @property
    def config_dir(self) -> Path:
        return self.database_home / "config"

    @property
    def data_dir(self) -> Path:
        return self.database_home / "data"

    @property
    def postgres_env_file(self) -> Path:
        return self.config_dir / "postgres.env"

    def compose_env(self) -> dict[str, str]:
        config = DatabaseConfig(self.environment)

        return {
            "POSTGRES_DATA_DIR": str(config.data_dir),
            "POSTGRES_ENV_FILE": str(config.postgres_env_file),
        }