@echo off

pushd "%~dp0..\"

echo %CD%

python -m scripts_python.install_pulse_cli

popd
pause