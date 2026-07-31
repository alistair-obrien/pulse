@echo off
setlocal

title Deploy Development Server

powershell.exe -ExecutionPolicy Bypass -File "%~dp0../../scripts/client/configure-client.ps1" -Environment "production" -Platform "web"

pause