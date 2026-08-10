import importlib
import inspect
import pkgutil

from .base_service import BaseService

registered_service_types: dict[str, type[BaseService]] = {}

for module in pkgutil.iter_modules(__path__):
    if module.name.startswith("_") or module.name.startswith("base_"):
        continue

    service_module = importlib.import_module(
        f"{__name__}.{module.name}.service"
    )

    service_class = service_module.Service

    if not inspect.isclass(service_class):
        continue

    if not issubclass(service_class, BaseService):
        continue

    service_type = service_class.service_type

    if service_type in registered_service_types:
        raise RuntimeError(f"Duplicate service '{service_type}'.")

    registered_service_types[service_type] = service_class