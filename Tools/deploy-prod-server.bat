@echo off
setlocal

set "Environment=Production"

powershell.exe -ExecutionPolicy Bypass -File "%~dp0../Scripts/deploy-server.ps1" -Environment "%Environment%"

pause