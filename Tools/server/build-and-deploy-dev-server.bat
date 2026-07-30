@echo off
setlocal

title Deploy Development Server

powershell.exe -ExecutionPolicy Bypass -File "%~dp0../../scripts/server/build-and-deploy-server.ps1" -Environment "development"

pause