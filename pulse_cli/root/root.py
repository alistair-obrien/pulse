import os
import shlex
import subprocess
import traceback

from prompt_toolkit.history import FileHistory

from pulse_cli.common.log import (
    fmt_env,
    fmt_root,
    log_error,
    log_info,
    log_space,
    log_warning,
    log_title
)
from pulse_cli.env import PULSE_HOME
from pulse_cli.environment.environment import Environment

# ======================================================================
# Root
# ======================================================================

class Root:

    def __init__(self):

        self.root_path = PULSE_HOME
        self.selected_environment: Environment | None = None

        self.file_history = FileHistory(
            str(PULSE_HOME / "history")
        )

    # ==================================================================
    # View
    # ==================================================================

    def log_header(self) -> str:

        log_info(">>> Pulse management CLI <<<")

    def log_context(self) -> None:

        if self.selected_environment:

            self.selected_environment.log_context()

        else:
            log_info("= Available Environments =")

            for environment in self.available_environments():

                log_info(fmt_env(environment))

    def log_help(self) -> None:

        # TODO: This stays around when I have a service selected which is wrong
        if self.selected_environment:

            log_info("x          Close Environment")
            self.selected_environment.log_help()

        else:

            log_info("ls         List Available Environments")

            log_info("sel        Select a working Environment")

            log_info("mk         Make a new Environment")

            log_info("rm         Delete an Environment")

        log_info("q          Exit Pulse CLI")

    def log_intro(self) -> None:

        log_info("")
        self.log_header()
        log_info("")

        self.log_help()

        log_info("")

    # ==================================================================
    # Input
    # ==================================================================

    def accept(self, value: str) -> None:

        command = value.strip()

        if not command:
            return

        if command in (
            "q",
            "exit",
            "quit",
        ):
            raise SystemExit

        if command in (
            "help",
            "h"
        ):
            self.log_help()
            return

        if command == "clear":

            self.clear_screen()
            return

        # --------------------------------------------------------------
        # Persist command history.
        # --------------------------------------------------------------

        self.file_history.append_string(
            command
        )

        # --------------------------------------------------------------
        # Execute.
        # --------------------------------------------------------------

        self.execute(command)

    # ==================================================================
    # Environments
    # ==================================================================

    def available_environments(self) -> list[str]:

        if not self.root_path.exists():
            return []

        return sorted(
            path.name
            for path in self.root_path.iterdir()
            if path.is_dir()
        )

    def list_environments(self) -> None:

        environments = self.available_environments()

        if not environments:

            log_warning(
                "No environments found."
            )

            return

        log_space()
        log_title("Environments")

        for environment in environments:

            log_info(fmt_env(environment))

        log_space()

    def create_environment(
        self,
        environment_name: str,
    ) -> None:

        Environment(environment_name).install()

    def delete_environment(
        self,
        environment_name: str,
    ) -> None:

        Environment(environment_name).uninstall()

    def select_environment(
        self,
        environment_name: str,
    ) -> None:

        if environment_name.lower() == "none":

            self.selected_environment = None

            return

        if environment_name not in self.available_environments():

            log_error(f"no env called '{environment_name}'")

            return

        self.selected_environment = Environment(environment_name)

        log_info(f"Selected environment {fmt_env(environment_name)}")

        self.log_context()

    # ==================================================================
    # Commands
    # ==================================================================

    def execute(
        self,
        command: str,
    ) -> None:

        argv = shlex.split(command)

        if not argv:
            return

        # --------------------------------------------------------------
        # Environment context.
        # --------------------------------------------------------------

        if self.selected_environment:

            if argv[0] == "x":

                previous = self.selected_environment

                self.selected_environment = None

                log_info(
                    f"Closed environment "
                    f"{fmt_env(previous.name)}"
                )

                return

            self.selected_environment.execute(
                argv
            )

            return

        # --------------------------------------------------------------
        # Root context.
        # --------------------------------------------------------------

        self.execute_root(argv)

    def execute_root(
        self,
        argv: list[str],
    ) -> None:

        command = argv[0]
        args = argv[1:]

        match command:

            case "st":

                self.log_context()

            case "ls":

                self.list_environments()

            case "mk":

                if len(args) != 1:

                    log_error(
                        "Usage: mk <environment>"
                    )

                    return

                self.create_environment(
                    args[0]
                )

            case "rm":

                if len(args) != 1:

                    log_error(
                        "Usage: rm <environment>"
                    )

                    return

                self.delete_environment(
                    args[0]
                )

            case "sel":

                if len(args) != 1:

                    log_error(
                        "Usage: sel <environment>"
                    )

                    return

                self.select_environment(
                    args[0]
                )

            case _:

                log_error(
                    f"Unknown Command: {command}"
                )

    # ==================================================================
    # Utility
    # ==================================================================

    def clear_screen(self) -> None:

        # Cross-platform terminal clear using subprocess
        command = 'cls' if os.name == 'nt' else 'clear'
        subprocess.run(command, shell=True)

    # ==================================================================
    # Run
    # ==================================================================

    def run(self) -> None:

        self.log_intro()

        while True:

            try:

                value = input(self._prompt())

                self.accept(value)

            except KeyboardInterrupt:

                log_warning("")
                continue

            except EOFError:

                log_warning("")
                break

            except SystemExit:

                break

            except Exception as error:

                log_error(
                    f"{type(error).__name__}: {error}"
                )
                traceback.print_exc()

                continue

    # ==================================================================
    # Prompt
    # ==================================================================

    def _prompt(self) -> str:

        context: list[str] = [
            fmt_root("root"),
        ]

        if self.selected_environment:
            context.extend(
                self.selected_environment.get_context()
            )

        return " / ".join(context) + ": "