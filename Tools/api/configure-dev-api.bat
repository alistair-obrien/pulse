@echo off
setlocal

title Deploy Development API

powershell.exe -ExecutionPolicy Bypass -File "%~dp0../../scripts/api/configure-api.ps1" -Environment "development"

pause