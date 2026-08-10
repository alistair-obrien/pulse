@echo off

pushd "%~dp0..\"

echo %CD%

python -m pulse_cli.install.install_pulse_cli

popd
pause