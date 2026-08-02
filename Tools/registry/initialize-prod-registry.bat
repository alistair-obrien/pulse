@echo off
setlocal

title Initialize Prod Registry

powershell.exe -ExecutionPolicy Bypass -File "%~dp0../../scripts/registry/initialize-registry.ps1" -Environment "production"

pause