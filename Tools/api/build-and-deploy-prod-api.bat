@echo off

title Deploy Production API

setlocal

powershell.exe -ExecutionPolicy Bypass -File "%~dp0../../scripts/api/build-and-deploy-api.ps1" -Environment "production"

pause