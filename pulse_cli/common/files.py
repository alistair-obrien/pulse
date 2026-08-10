from pathlib import Path
import shutil
from typing import Any

from pulse_cli.common.log import (
    log_info,
    log_job_footer,
    log_job_header,
    log_task_footer,
    log_task_header,
)


def write_config_file(
    path: Path,
    env_vars: dict[str, Any],
) -> None:

    env_text = "\n".join(
        f"{key}={value}"
        for key, value in env_vars.items()
    ) + "\n"

    write_text_to_file(
        path,
        env_text,
    )


def write_text_to_file(
    path: Path,
    text: str,
) -> None:

    log_task_header(
        f"Writing '{path}'"
    )

    path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    log_info(text)

    path.write_text(
        text,
        encoding="utf-8",
    )

    log_task_footer(
        f"Wrote '{path}'"
    )


def read_text_from_file(
    path: Path,
) -> str:

    if not path.exists():

        log_info(
            "File does not exist."
        )

        return ""

    return path.read_text(
        encoding="utf-8"
    )


def install_directory_tree(
    root: Path,
    directories: list[str] | None = None,
) -> None:

    log_job_header(
        f"Installing '{root}'"
    )

    root.mkdir(
        parents=True,
        exist_ok=True,
    )

    log_info(
        f"Created directory '{root}'"
    )

    for directory in directories or []:

        path = root / directory

        path.mkdir(
            parents=True,
            exist_ok=True,
        )

        log_info(
            f"Created directory '{path}'"
        )

    log_job_footer(
        f"Clean installed '{root}'"
    )


def uninstall_directory_tree(
    path: Path,
) -> None:

    if not path.exists():
        return

    shutil.rmtree(path)

    log_info(
        f"Removed directory '{path}'"
    )


def remove_file(
    path: Path,
) -> None:

    if not path.exists():
        return

    path.unlink()

    log_info(
        f"Removed file '{path}'"
    )