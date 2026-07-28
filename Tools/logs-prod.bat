@echo off
title Production Server Logs

setlocal

set "Environment=Production"

powershell.exe -ExecutionPolicy Bypass -File "%~dp0../Scripts/log-server.ps1" -Environment "%Environment%"

pause