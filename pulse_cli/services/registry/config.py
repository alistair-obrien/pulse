from dataclasses import dataclass, field
from pathlib import Path

from scripts_python.services.base_config import BaseConfig
from scripts_python.new_services.nginx.config import NginxCertificate, NginxLocation, NginxSite, TlsMode

@dataclass
class Config(BaseConfig):

    service_name: str = field(default="registry", init=False)

    registry_hostname: str = "dev-registry.pulse-flow.app"

    host_port: int = 5100
    container_port: int = 5000

    @property
    def auth_dir(self) -> Path:
        return self.config_dir / "auth"

    @property
    def certs_dir(self) -> Path:
        return self.config_dir / "certs"

    @property
    def htpasswd(self) -> Path:
        return self.auth_dir / "htpasswd"

    @property
    def config_file(self) -> Path:
        return self.config_dir / "config.yml"

    def compose_env(self) -> dict[str, str]:
        return {
            "REGISTRY_CONFIG_DIR": self.config_dir,
            "REGISTRY_DATA_DIR": self.data_dir,
            "HOST_PORT": self.host_port,
            "CONTAINER_PORT": self.container_port,
        }

    def nginx_sites(self) -> list[NginxSite]:
        return [
            NginxSite(
                filename="registry.conf",
                server_name=self.registry_hostname,
                tls_mode=TlsMode.REDIRECT,
                certificate=NginxCertificate(
                    name="pulse-flow",
                ),
                locations=[
                    NginxLocation(
                        path="/",
                        upstream_host=self.service_name,
                        upstream_port=self.container_port,
                        directives=[
                            "client_max_body_size 0;",
                            "proxy_set_header Docker-Distribution-Api-Version registry/2.0;",
                        ],
                    )
                ],
            )
        ]