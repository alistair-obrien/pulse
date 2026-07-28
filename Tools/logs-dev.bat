@echo off
title Development Server Logs

setlocal

set "Environment=Development"

powershell.exe -ExecutionPolicy Bypass -File "%~dp0../Scripts/log-server.ps1" -Environment "%Environment%"

pause