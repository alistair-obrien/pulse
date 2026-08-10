from dataclasses import dataclass
from pathlib import Path

from pulse_cli.services.base_config import BaseConfig
from pulse_cli.services.nginx.config import NginxCertificate, NginxLocation, NginxSite, TlsMode

@dataclass
class Config(BaseConfig):

    name:str = "default"
    service_type = "woodpecker"

    # host_port: int = 5100
    container_port: int = 5000

    woodpecker_hostname:str = "https://dev-build.pulse-flow.app/"

    def compose_env(self) -> dict[str, str]:
        return {
            "CONTAINER_PORT": str(self.container_port),
        }

    def nginx_sites(self) -> list[NginxSite]:
        return [
            NginxSite(
                filename="woodpecker.conf",
                server_name=self.woodpecker_hostname,
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