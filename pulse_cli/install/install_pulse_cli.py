from pathlib import Path
import subprocess
import tarfile
import tempfile

from scripts_python.common.log import (
    log_job_footer,
    log_job_header,
    log_task_footer,
    log_task_header,
)

EXCLUDED_DIRS = {"__pycache__", ".git", ".idea", ".vscode"}
EXCLUDED_SUFFIXES = {".pyc", ".pyo"}

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
SCRIPTS_DIR = REPO_ROOT / "scripts_python"
ARCHIVE = Path(tempfile.gettempdir()) / "scripts_python.tar"


def should_include(path: Path) -> bool:
    return (
        path != ARCHIVE
        and not any(part in EXCLUDED_DIRS for part in path.parts)
        and path.suffix not in EXCLUDED_SUFFIXES
    )


log_job_header("Beginning Installation")
server = input("Server: ")
log_job_footer("Installation Began")

log_job_header("Installing Pulse")

log_task_header(f"Archiving Scripts Folder to {ARCHIVE}")

with tarfile.open(ARCHIVE, "w") as tar:
    for path in SCRIPTS_DIR.rglob("*"):
        if should_include(path):
            tar.add(path, arcname=path.relative_to(REPO_ROOT))

log_task_footer(f"Archived Scripts to {ARCHIVE}")

destination = f"{server}:/tmp"

log_task_header(f"Transferring Installer to '{destination}'")

subprocess.run(
    [
        "scp",
        str(ARCHIVE),
        f"{server}:/tmp/",
    ],
    check=True,
)

log_task_footer(f"Installer Transferred to '{destination}'")

log_task_header("Cleaning Up")

ARCHIVE.unlink(missing_ok=True)

log_task_footer("Cleaned Up")

log_task_header(f"Running installer on '{server}'")

subprocess.run(
    [
        "ssh",
        "-tt",
        server,
        r"""
set -e

sudo rm -rf /tmp/scripts_python

sudo tar -xf /tmp/scripts_python.tar -C /tmp

sudo mkdir -p /opt/pulse

sudo docker build \
    -f /tmp/scripts_python/Dockerfile \
    -t pulse:latest \
    /tmp

sudo install \
    -m 755 \
    /tmp/scripts_python/pulse.sh \
    /usr/local/bin/pulse

sudo rm -rf /tmp/scripts_python
sudo rm -f /tmp/scripts_python.tar
""",
    ],
    check=True,
)

log_task_footer(f"Installer completed on '{server}'")

log_job_footer("Pulse Installed")