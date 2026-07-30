@echo off
title Development Server Logs

setlocal

powershell.exe -ExecutionPolicy Bypass -File "%~dp0../../scripts/server/open-server-logs.ps1" -Environment "development"

pause