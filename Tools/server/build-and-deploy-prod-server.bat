@echo off

title Deploy Production Web Client

setlocal

powershell.exe -ExecutionPolicy Bypass -File "%~dp0../../scripts/server/build-and-deploy-server.ps1" -Environment "production"

pause