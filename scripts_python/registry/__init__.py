import importlib
import pkgutil

import typer

app = typer.Typer()

for _, module_name, _ in pkgutil.iter_modules(__path__):
    if module_name.startswith("_"):
        continue
    importlib.import_module(f"{__name__}.{module_name}")