import socket

from colorama import Fore, init


init(autoreset=False)

HOST_NAME = socket.gethostname()


# ======================================================================
# Output
# ======================================================================

def _echo(message: str) -> None:

    print(message)


# ======================================================================
# Colors
# ======================================================================

def _color_environment(name: str) -> str:

    return {
        "development": Fore.CYAN,
        "production": Fore.MAGENTA,
        "localhost": Fore.WHITE,
    }.get(
        name,
        Fore.LIGHTBLACK_EX,
    )


def _color_platform(name: str) -> str:

    return {
        "web": Fore.WHITE,
        "android": Fore.CYAN,
        "ios": Fore.MAGENTA,
    }.get(
        name,
        Fore.LIGHTBLACK_EX,
    )


def _color_application(name: str) -> str:

    return {
        "api": Fore.WHITE,
        "client": Fore.CYAN,
    }.get(
        name,
        Fore.LIGHTBLACK_EX,
    )


def _prefix(
    base_color: str,
    environment_name: str | None = None,
    platform_name: str | None = None,
    application_name: str | None = None,
) -> str:

    parts = [
        f"{base_color}[{Fore.YELLOW}{HOST_NAME}{base_color}]"
    ]

    if environment_name:

        parts.append(
            f"{base_color}["
            f"{_color_environment(environment_name)}"
            f"{environment_name}"
            f"{base_color}]"
        )

    if platform_name:

        parts.append(
            f"{base_color}["
            f"{_color_platform(platform_name)}"
            f"{platform_name}"
            f"{base_color}]"
        )

    if application_name:

        parts.append(
            f"{base_color}["
            f"{_color_application(application_name)}"
            f"{application_name}"
            f"{base_color}]"
        )

    return " " + " ".join(parts)


# ======================================================================
# Headers / Footers
# ======================================================================

def _header(
    prefix: str,
    color: str,
    separator: str,
    title: str,
    environment_name: str | None = None,
    platform_name: str | None = None,
    application_name: str | None = None,
) -> None:

    width = 6

    _echo(
        f"{color}{prefix}"
        f"{_prefix(color, environment_name, platform_name, application_name)} "
        f"{title}"
    )

    _echo(
        color + separator * width
    )


def _footer(
    color: str,
    checkmark: str,
    checkmark_color: str,
    separator: str,
    title: str,
) -> None:

    width = 6

    _echo(
        f"{checkmark_color}{checkmark}"
        f"{color} {title}"
    )

    _echo(
        color + separator * width
    )

    _echo("")


# ======================================================================
# Job Logging
# ======================================================================

def log_job_header(
    title: str,
    environment_name: str | None = None,
    platform_name: str | None = None,
    application_name: str | None = None,
) -> None:

    _header(
        prefix=">",
        color=Fore.LIGHTBLUE_EX,
        separator="=",
        title=title,
        environment_name=environment_name,
        platform_name=platform_name,
        application_name=application_name,
    )


def log_job_footer(
    title: str,
) -> None:

    _footer(
        color=Fore.LIGHTBLUE_EX,
        checkmark="✓",
        checkmark_color=Fore.LIGHTGREEN_EX,
        separator="=",
        title=title,
    )


# ======================================================================
# Task Logging
# ======================================================================

def log_task_header(
    title: str,
    environment_name: str | None = None,
    platform_name: str | None = None,
    application_name: str | None = None,
) -> None:

    _header(
        prefix=">",
        color=Fore.BLUE,
        separator="-",
        title=f"{title} <",
        environment_name=environment_name,
        platform_name=platform_name,
        application_name=application_name,
    )


def log_task_footer(title: str,) -> None:
    _footer(
        color=Fore.BLUE,
        checkmark="✓",
        checkmark_color=Fore.GREEN,
        separator="-",
        title=title,
    )


# ======================================================================
# Messages
# ======================================================================

def log_space() -> None:
    _echo("")

def log_title(message: str) -> None:
    _echo(fmt_title(message))

def log_info(message: str) -> None:
    _echo(fmt_info(message))


def log_warning(message: str) -> None:
    _echo(fmt_wrn(message))


def log_error(message: str) -> None:
    _echo(fmt_err(message))


# ======================================================================
# Formatting
# ======================================================================

def fmt_info(message: str) -> str:
    return (
        Fore.WHITE
        + message
        + Fore.RESET
    )


def fmt_err(message: str) -> str:
    return (
        Fore.RED
        + "[ERR] "
        + message
        + Fore.RESET
    )


def fmt_wrn(message: str) -> str:
    return (
        Fore.YELLOW
        + "[WRN] "
        + message
        + Fore.RESET
    )


def fmt_ntw(network_name: str,) -> str:
    return (
        Fore.CYAN
        + network_name
        + Fore.RESET
    )

def fmt_cmp(comp_name: str,) -> str:
    return (
        Fore.YELLOW
        + comp_name
        + Fore.RESET
    )

def fmt_env(environment_name: str) -> str:
    return (
        Fore.BLUE
        + environment_name
        + Fore.RESET
    )

def fmt_svc(service_name: str) -> str:
    return (
        Fore.MAGENTA
        + service_name
        + Fore.RESET
    )

def fmt_root(root_text: str) -> str:
    return (
        Fore.GREEN
        + root_text
        + Fore.RESET
    )

def fmt_title(title: str) -> str:
    return (
        Fore.WHITE
        + f">> {title} <<"
        + Fore.RESET
    )