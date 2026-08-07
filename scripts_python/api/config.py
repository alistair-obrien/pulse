from pathlib import Path
from scripts_python.common import context

def compose_env(environment: str) -> dict[str, str]:
    return {
        "API_HOME": str(context.component_root(environment, "api")),
        "API_PORT": "5100",
    }