from pulse_cli.composition.compose_definition import ComposeDefinition
from dataclasses import dataclass, field
from pathlib import Path

from pulse_cli.services.base_service import BaseService

from .config import Config

class Service(BaseService):

    service_type = "nginx"

    def __init__(
        self,
        environment: str,
        composition: str,
        name: str,
    ):
        super().__init__(name)

        self.config = Config(
            environment,
            composition,
            name,
        )

    def get_compose_definition(self) -> ComposeDefinition:

        return ComposeDefinition(
            image="woodpeckerci/woodpecker-server:next-e8907931a0",

            restart="unless-stopped",

            user="root",

            environment={
                "WOODPECKER_HOST": "https://build.pulse-flow.app",
                "WOODPECKER_GITHUB": "true",
                "WOODPECKER_GITHUB_CLIENT": "Ov23li3GZujP4ajQzfMy",
                "WOODPECKER_GITHUB_SECRET": "d94a9f03744089bac7c3dd1e8c4594833e081cb1",
                "WOODPECKER_AGENT_SECRET": "TODO",
            },

            volumes=[
                f"{self.config.data_home.as_posix()}:/var/lib/woodpecker"
            ],
        )


# networks:
#   default:
#     external: true
#     name: ${ENVIRONMENT}_network

# services:
#   nginx:
#     image: nginx:latest
#     container_name: pulse_${ENVIRONMENT}_nginx
#     restart: unless-stopped
#     volumes:
#       - ${NGINX_CONF_DIR}:/etc/nginx/conf.d:ro
#       - ${NGINX_CERTS_DIR}:/etc/nginx/certs:ro
#       - ${NGINX_HTML_DIR}:/usr/share/nginx/html:ro
#     networks:
#       - default
#     ports:
#       - "80:80"
#       - "443:443"