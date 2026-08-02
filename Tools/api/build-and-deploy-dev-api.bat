@echo off
setlocal

title Deploy Development API

powershell.exe -ExecutionPolicy Bypass -File "%~dp0../../scripts/api/build-and-deploy-api.ps1" -Environment "development"

pause