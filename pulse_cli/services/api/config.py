from collections import defaultdict
from dataclasses import dataclass, field, fields
from getpass import getpass
from pathlib import Path

from pulse_cli.services.base_config import BaseConfig

from pulse_cli.services.nginx.config import NginxCertificate, NginxLocation, NginxSite, TlsMode

from pulse_cli.common.files import (
    read_text_from_file,
    write_text_to_file,
)

@dataclass
class Config(BaseConfig):
    
    registry_image_name: str = field(
        default="api:latest",
        metadata={
            "editable": True,
            "category": "Registry",
            "description": "Docker image",
        },
    )

    remote_registry: bool = field(
        default=False,
        metadata={
            "editable": True,
            "category": "Registry",
            "description": "Use remote registry",
        },
    )

    remote_registry_hostname: str = field(
        default="dev-registry.pulse-flow.app",
        metadata={
            "editable": True,
            "category": "Registry",
            "description": "Remote hostname",
        },
    )

    remote_registry_port: int = field(
        default=5100,
        metadata={
            "editable": True,
            "category": "Registry",
            "description": "Remote port",
        },
    )

    local_registry_port: int = field(
        default=5100,
        metadata={
            "editable": True,
            "category": "Registry",
            "description": "Local port",
        },
    )

    # ========================================================================
    # Database
    # ========================================================================

    remote_database: bool = field(
        default=False,
        metadata={
            "editable": True,
            "category": "Database",
            "description": "Use remote database",
        },
    )

    remote_database_hostname: str = field(
        default="10.0.0.1",
        metadata={
            "editable": True,
            "category": "Database",
            "description": "Remote hostname",
        },
    )

    remote_database_port: int = field(
        default=5432,
        metadata={
            "editable": True,
            "category": "Database",
            "description": "Remote port",
        },
    )

    local_database_port: int = field(
        default=5432,
        metadata={
            "editable": True,
            "category": "Database",
            "description": "Local port",
        },
    )

    database_password: str = field(
        default="",
        metadata={
            "editable": True,
            "category": "Database",
            "description": "Database password",
            "secret": True,
        },
    )

    # ========================================================================
    # API
    # ========================================================================

    api_hostname: str = field(
        default="dev-api.pulse-flow.app",
        metadata={
            "editable": True,
            "category": "API",
            "description": "Hostname",
        },
    )

    api_port: int = field(
        default=5000,
        metadata={
            "editable": True,
            "category": "API",
            "description": "Port",
        },
    )

    log_level: str = field(
        default="Information",
        metadata={
            "editable": True,
            "category": "API",
            "description": "Log level",
            "choices": [
                "Trace",
                "Debug",
                "Information",
                "Warning",
                "Error",
                "Critical",
            ],
        },
    )

    # ========================================================================

    def __post_init__(self):
        self.load_from_disk()

    # ------------------------------------------------------------------------
    # Derived Paths
    # ------------------------------------------------------------------------


    @property
    def config_file(self) -> Path:
        return self.config_dir / "pulse.config"

    @property
    def dotnet_env_file(self) -> Path:
        return self.config_dir / "dotnet.env"

    # ------------------------------------------------------------------------
    # Docker
    # ------------------------------------------------------------------------

    def compose_env(self) -> dict[str, str]:
        registry_host = (
            self.remote_registry_hostname
            if self.remote_registry
            else "registry"
        )

        registry_port = (
            self.remote_registry_port
            if self.remote_registry
            else self.local_registry_port
        )

        return {
            "REGISTRY_HOST": registry_host,
            "REGISTRY_PORT": str(registry_port),
            "API_IMAGE": self.registry_image_name,
            "DOTNET_ENV_FILE": str(self.dotnet_env_file),
            "CONFIG_DIR": str(self.config_dir),
            "API_PORT": str(self.api_port),
        }

    # ------------------------------------------------------------------------
    # Reflection helpers
    # ------------------------------------------------------------------------

    def editable_fields(self):
        return [
            f
            for f in fields(self)
            if f.metadata.get("editable", False)
        ]

    def grouped_fields(self):
        groups = defaultdict(list)

        for f in self.editable_fields():
            groups[f.metadata.get("category", "General")].append(f)

        return groups

    # ------------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------------

    def load_from_disk(self):
        if not self.config_file.exists():
            return

        values = {}

        for line in read_text_from_file(self.config_file).splitlines():
            line = line.strip()

            if not line or line.startswith("#"):
                continue

            key, _, value = line.partition("=")

            values[key] = value

        for f in self.editable_fields():
            if f.name not in values:
                continue

            value = values[f.name]

            if f.type is bool:
                value = value.lower() in (
                    "true",
                    "1",
                    "yes",
                    "y",
                    "on",
                )

            elif f.type is int:
                value = int(value)

            setattr(self, f.name, value)

    def save_to_disk(self):
        self.config_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        lines = []

        for category, group in self.grouped_fields().items():
            lines.append(f"# {category}")

            for f in group:
                value = getattr(self, f.name)

                if isinstance(value, bool):
                    value = str(value).lower()

                lines.append(f"{f.name}={value}")

            lines.append("")

        write_text_to_file(
            self.config_file,
            "\n".join(lines).rstrip(),
        )

        # TODO: Also edit NGINX config for this service

    # ------------------------------------------------------------------------
    # Interactive configuration
    # ------------------------------------------------------------------------

    def configure(self):
        print()

        for category, group in self.grouped_fields().items():
            print(f"=== {category} ===")

            for f in group:
                current = getattr(self, f.name)

                description = f.metadata.get(
                    "description",
                    f.name.replace("_", " ").title(),
                )

                choices = f.metadata.get("choices")
                secret = f.metadata.get("secret", False)

                prompt = description

                if choices:
                    prompt += f" ({'/'.join(map(str, choices))})"

                prompt += f" [{current}]: "

                if secret:
                    answer = getpass(prompt)
                else:
                    answer = input(prompt)

                answer = answer.strip()

                if not answer:
                    continue

                if choices and answer not in map(str, choices):
                    print("Invalid option.")
                    continue

                if f.type is bool:
                    answer = answer.lower() in (
                        "true",
                        "1",
                        "yes",
                        "y",
                        "on",
                    )
                elif f.type is int:
                    answer = int(answer)

                setattr(self, f.name, answer)

            print()

        self.save_to_disk()

    def nginx_sites(self):
        return [
            NginxSite(
                filename="api.conf",
                server_name=self.api_hostname,
                tls_mode=TlsMode.REDIRECT,
                certificate=NginxCertificate(
                    name="pulse-flow"
                ),
                locations=[
                    NginxLocation(
                        path="/",
                        upstream_host="api",
                        upstream_port=self.api_port,
                    )
                ],
            )
        ]