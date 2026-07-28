@echo off
setlocal

title Deploy Development Server

set "Environment=Development"

powershell.exe -ExecutionPolicy Bypass -File "%~dp0../Scripts/deploy-server.ps1" -Environment "%Environment%"

pause