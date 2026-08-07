from pathlib import Path
import shutil


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def clean_install_directory(root: Path, directories: list[str]) -> None:
    root.mkdir(parents=True, exist_ok=True)

    for directory in directories:
        path = root / directory

        if path.exists():
            shutil.rmtree(path)

        path.mkdir(parents=True, exist_ok=True)

def remove_directory(root: Path):
    if root.exists():
        shutil.rmtree(root)