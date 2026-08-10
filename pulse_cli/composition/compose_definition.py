from dataclasses import asdict, dataclass, field

@dataclass
class ComposeDefinition:

    image: str

    environment: dict[str, str] = field(
        default_factory=dict
    )

    volumes: list[str] = field(
        default_factory=list
    )

    ports: list[str] = field(
        default_factory=list
    )

    networks: list[str] = field(
        default_factory=list
    )

    depends_on: list[str] = field(
        default_factory=list
    )

    restart: str | None = None

    healthcheck: dict | None = None

    user: str = "root"

    def to_dict(self, container_name:str) -> dict:
        values = asdict(self)

        values["container_name"] = container_name
        
        return {
            key: value
            for key, value in values.items()
            if value
        }