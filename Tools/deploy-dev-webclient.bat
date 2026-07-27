@echo off
setlocal

set "Environment=Development"

powershell.exe -ExecutionPolicy Bypass -File "%~dp0../Scripts/deploy-webclient.ps1" -Environment "%Environment%"

pause