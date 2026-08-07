import socket

from colorama import Fore, Style, init
import shutil

init(autoreset=True)
HOST_NAME = socket.gethostname()

def _color_environment(name: str) -> str:
    return {
        "development": Fore.CYAN,
        "production": Fore.MAGENTA,
        "localhost": Fore.WHITE,
    }.get(name, Fore.LIGHTBLACK_EX)


def _color_platform(name: str) -> str:
    return {
        "web": Fore.WHITE,
        "android": Fore.CYAN,
        "ios": Fore.MAGENTA,
    }.get(name, Fore.LIGHTBLACK_EX)


def _color_application(name: str) -> str:
    return {
        "api": Fore.WHITE,
        "client": Fore.CYAN,
    }.get(name, Fore.LIGHTBLACK_EX)


def _prefix(
    base_color: str,
    environment_name: str | None = None,
    platform_name: str | None = None,
    application_name: str | None = None,
) -> str:
    parts: list[str] = [
        f"{base_color}[{Fore.YELLOW}{HOST_NAME}{base_color}]"
    ]

    if environment_name:
        parts.append(
            f"{base_color}[{_color_environment(environment_name)}{environment_name}{base_color}]"
        )

    if platform_name:
        parts.append(
            f"{base_color}[{_color_platform(platform_name)}{platform_name}{base_color}]"
        )

    if application_name:
        parts.append(
            f"{base_color}[{_color_application(application_name)}{application_name}{base_color}]"
        )

    return " " + " ".join(parts)


def _header(
    prefix: str,
    color: str,
    separator: str,
    title: str,
    environment_name: str | None = None,
    platform_name: str | None = None,
    application_name: str | None = None,
):
    width = shutil.get_terminal_size().columns

    print()
    print(
        f"{color}{prefix}"
        f"{_prefix(color, environment_name, platform_name, application_name)} "
        f"{title}"
    )
    print(color + separator * width)


def _footer(
    color: str,
    checkmark: str,
    checkmark_color: str,
    separator: str,
    title: str,
):
    width = shutil.get_terminal_size().columns

    print(f"{checkmark_color}{checkmark}{color} {title}")
    print(color + separator * width)
    print()


def log_job_header(
    title: str,
    environment_name: str | None = None,
    platform_name: str | None = None,
    application_name: str | None = None,
):
    _header(
        prefix=">",
        color=Fore.LIGHTBLUE_EX,
        separator="=",
        title=title,
        environment_name=environment_name,
        platform_name=platform_name,
        application_name=application_name,
    )


def log_job_footer(title: str):
    _footer(
        color=Fore.LIGHTBLUE_EX,
        checkmark="✓",
        checkmark_color=Fore.LIGHTGREEN_EX,
        separator="=",
        title=title,
    )


def log_task_header(
    title: str,
    environment_name: str | None = None,
    platform_name: str | None = None,
    application_name: str | None = None,
):
    _header(
        prefix=">",
        color=Fore.BLUE,
        separator="-",
        title=f"{title} <",
        environment_name=environment_name,
        platform_name=platform_name,
        application_name=application_name,
    )


def log_task_footer(title: str):
    _footer(
        color=Fore.BLUE,
        checkmark="✓",
        checkmark_color=Fore.GREEN,
        separator="-",
        title=title,
    )


def log_info(message: str):
    print(Fore.WHITE + message)


def log_warning(message: str):
    print(Fore.YELLOW + message)


def log_error(message: str):
    print(Fore.RED + message)