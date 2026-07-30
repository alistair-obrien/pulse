@echo off
title Production Server Logs

setlocal

powershell.exe -ExecutionPolicy Bypass -File "%~dp0../../scripts/server/open-server-logs.ps1" -Environment "production"

pause