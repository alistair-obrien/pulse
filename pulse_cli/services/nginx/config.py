from dataclasses import dataclass, field
from pathlib import Path

from enum import Enum

from pulse_cli.services.base_config import BaseConfig

class TlsMode(Enum):
    HTTP = "http"
    REDIRECT = "redirect"
    HTTPS = "https"

@dataclass
class NginxCertificate:
    name: str

@dataclass
class NginxLocation:
    path: str
    upstream_host: str
    upstream_port: int

    directives: list[str] = field(default_factory=list)

@dataclass
class NginxSite:
    filename: str
    server_name: str

    locations: list[NginxLocation] = field(default_factory=list)

    tls_mode: TlsMode = TlsMode.REDIRECT
    certificate: NginxCertificate | None = None

@dataclass
class Config(BaseConfig):

    name:str = "default"
    service_type = "nginx"

    @property
    def directories(self) -> list[Path]:
        return [
            self.config.nginx_confd_dir,
            self.config.nginx_certs_dir,
            self.config.nginx_html_dir,
            self.config.data_dir,
            self.config.config_dir
        ]

    @property
    def config_file(self) -> Path:
        return self.config_dir / "pulse.config"

    @property
    def nginx_confd_dir(self) -> Path:
        return self.config_dir / "conf.d"

    @property
    def nginx_certs_dir(self) -> Path:
        return self.config_dir / "certs"

    @property
    def nginx_html_dir(self) -> Path:
        return self.data_dir / "html"

    @property
    def nginx_config_file(self) -> Path:
        return self.config_dir / "nginx.conf"

    def compose_env(self) -> dict[str, str]:
        return {
            "NGINX_CONF_DIR": self.nginx_confd_dir,
            "NGINX_CERTS_DIR": self.nginx_certs_dir,
            "NGINX_HTML_DIR": self.nginx_html_dir,
        }