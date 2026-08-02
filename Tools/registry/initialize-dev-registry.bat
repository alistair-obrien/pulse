@echo off
setlocal

title Initialize Dev Registry

powershell.exe -ExecutionPolicy Bypass -File "%~dp0../../scripts/registry/initialize-registry.ps1" -Environment "development"

pause