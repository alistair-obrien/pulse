@echo off

title Deploy Production Web Client

setlocal

set "Environment=Production"

powershell.exe -ExecutionPolicy Bypass -File "%~dp0../Scripts/deploy-server.ps1" -Environment "%Environment%"

pause