@echo off
setlocal

title Initialize LocalHost Registry

powershell.exe -ExecutionPolicy Bypass -File "%~dp0../../scripts/registry/initialize-registry.ps1" -Environment "localhost"

pause