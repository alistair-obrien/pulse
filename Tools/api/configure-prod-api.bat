@echo off
setlocal

title Deploy Production API

powershell.exe -ExecutionPolicy Bypass -File "%~dp0../../scripts/api/configure-api.ps1" -Environment "production"

pause