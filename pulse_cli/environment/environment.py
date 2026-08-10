from dataclasses import dataclass
import shutil
from pathlib import Path

from pulse_cli.common import docker
from pulse_cli.composition.composition import Composition
from pulse_cli.common.files import write_config_file
from pulse_cli.common.log import (
    fmt_cmp,
    fmt_env,
    fmt_ntw,
    log_error,
    log_info,
    log_job_footer,
    log_job_header,
    log_title,
    log_warning,
)
from pulse_cli.env import PULSE_HOME

# ======================================================================
# Environment
# ======================================================================

class Environment:

    def __init__(self, name: str):

        self.name = name

        self.selected_comp: Composition | None = None # Probably better to make this a def so each op creates a transient wrapper

    # ==================================================================
    # Properties
    # ==================================================================

    @property
    def root_path(self) -> Path:

        return PULSE_HOME / self.name

    @property
    def compositions_path(self) -> Path:

        return self.root_path

    @property
    def network_name(self) -> str:

        return f"{self.name}_network"

    # ==================================================================
    # Context
    # ==================================================================
    def get_context(self) -> list[str]:
        context = []

        context.append(fmt_env(self.name))

        if (self.selected_comp):
            context.extend(self.selected_comp.get_context())

        return context 

    # ==================================================================
    # Lifecycle
    # ==================================================================

    def install(self) -> None:

        if self.root_path.exists():

            log_error(
                f"Environment "
                f"{fmt_env(self.name)} "
                f"is already installed."
            )

            return

        log_job_header(
            f"Creating Environment "
            f"{fmt_env(self.name)}"
        )

        self.root_path.mkdir(
            parents=True,
            exist_ok=False,
        )

        docker.add_network(
            self.network_name
        )

        write_config_file(
            self.root_path / "env.config",
            {
                "Hello": "Hi",
            },
        )

        log_job_footer(
            f"Created Environment "
            f"{fmt_env(self.name)}"
        )

    def uninstall(self) -> None:

        if not self.root_path.exists():

            log_error(
                f"Environment "
                f"{fmt_env(self.name)} "
                f"does not exist."
            )

            return

        docker.remove_network(
            self.network_name
        )

        shutil.rmtree(
            self.root_path
        )

        log_info(
            f"Removed environment "
            f"{fmt_env(self.name)}."
        )

    # ==================================================================
    # Configuration
    # ==================================================================

    def configure(self) -> None:

        values: dict[str, str] = {}

        values["RESTART"] = input(
            "Restart: "
        ) # unless-stopped

        write_config_file(
            self.root_path / "env.config",
            values,
        )

        log_info(
            f"Configured environment "
            f"{fmt_env(self.name)}"
        )

    # ==================================================================
    # Compositions
    # ==================================================================
    def available_compositions(self) -> list[str]:

        if not self.compositions_path.exists():
            return []

        compositions: list[str] = []

        for item in self.compositions_path.iterdir():

            if not item.is_dir():
                continue

            compositions.append(item.name)

        return sorted(compositions)

    # ==================================================================
    # Environment Operations
    # ==================================================================

    def start(self) -> None:

        log_info(f"Starting {fmt_env(self.name)}")

        for composition in self.available_compositions():
            self.make_composition_wrapper(composition).start()

        log_info(f"Started {fmt_env(self.name)}")

    def stop(self) -> None:

        log_info(f"Stopping {fmt_env(self.name)}")

        for composition in reversed(self.available_compositions()):
            self.make_composition_wrapper(composition).stop()

        log_info(f"Stopped {fmt_env(self.name)}")

    def restart(self) -> None:

        self.stop()
        self.start()

    def status(self) -> None:
        self.log_context()


    def logs(self) -> None:

        for composition in self.available_compositions():
            self.make_composition_wrapper(composition).logs()

    # ==================================================================
    # Composition
    # ==================================================================

    def make_composition_wrapper(self, composition:str) -> Composition:

        return Composition(self.name, composition)

    def create_composition(
        self,
        composition_name: str,
    ) -> None:

        if composition_name in self.available_compositions():
            log_error(
                f"Composition "
                f"{fmt_cmp(composition_name)}"
                f"already exists."
            )
            return

        self.make_composition_wrapper(composition_name).install()

    def delete_composition(
        self,
        composition_name: str,
    ) -> None:

        if not composition_name in self.available_compositions():
            log_error(
                f"Composition "
                f"{fmt_cmp(composition_name)}"
                f"does not exist."
            )
            return

        self.make_composition_wrapper(composition_name).uninstall()


    def list_networks(self) -> None:
        log_title("Network")
        log_info(fmt_ntw(self.network_name))

    def list_compositions(self) -> None:

        compositions = self.available_compositions()

        if not compositions:

            log_warning(
                "No compositions found."
            )

            return

        log_title("Compositions")

        for composition in compositions:
            comp_shell = self.make_composition_wrapper(composition)
            log_info(f"{fmt_cmp(comp_shell.name)}    {comp_shell.status_string()}")

    def select_composition(
        self,
        composition:str,
    ) -> None:

        if composition not in self.available_compositions():
            log_error(
                f"Composition "
                f"{composition} "
                f"does not exist."
            )
            return

        self.selected_comp = self.make_composition_wrapper(composition)

        log_info(
            f"Selected composition "
            f"{self.selected_comp.formatted_name}"
        )

        self.log_context()

    # ==================================================================
    # Commands
    # ==================================================================

    def execute(
        self,
        argv: list[str],
    ) -> None:

        if not argv:
            return

        command = argv[0]
        args = argv[1:]

        # --------------------------------------------------------------
        # Composition context
        # --------------------------------------------------------------

        if self.selected_comp:

            if command == "x":

                previous = self.selected_comp

                self.selected_comp = None

                log_info(f"Closed composition {fmt_cmp(previous)}")

                return

            self.selected_comp.execute(argv)

            return

        # --------------------------------------------------------------
        # Environment context
        # --------------------------------------------------------------

        match command:

            case "cfg":

                self.configure()

            case "ls":

                self.list_compositions()

            case "mk":

                if len(args) != 1:

                    log_error("Usage: mk <comp_name>")

                    return

                self.create_composition(args[0])

            case "rm":

                if len(args) != 1:

                    log_error(
                        "Usage: rm <comp_name>"
                    )

                    return

                self.delete_composition(
                    args[0]
                )

            case "sel":

                if len(args) != 1:

                    log_error(
                        "Usage: sel <comp_name>"
                    )

                    return
                self.select_composition(
                    args[0]
                )

            case "t":

                self.start()

            case "p":

                self.stop()

            case "r":

                self.restart()

            case "status":

                self.status()

            case "logs":

                self.logs()

            case _:

                log_error(
                    f"Unknown Command: {command}"
                )

    # ==================================================================
    # View
    # ==================================================================

    def log_context(self) -> None:

        if self.selected_comp:

            self.selected_comp.log_context()
                        
        else:
            self.list_networks()
            self.list_compositions()


    def log_help(self) -> None:

        if self.selected_comp:

            log_info("x          Close Composition")
            self.selected_comp.log_help()
            return

        log_info("cfg        Configure Environment")

        log_info("ls         List Compositions")

        log_info("sel        Select a Composition")

        log_info("mk         Make a new Composition")

        log_info("rm         Delete a Composition")

        log_info("t          Start Environment")

        log_info("p          Stop Environment")

        log_info("r          Restart Environment")

        log_info("status     Show Status")

        log_info("logs       Show Logs")