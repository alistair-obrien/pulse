@echo off
title Production API Logs

setlocal

powershell.exe -ExecutionPolicy Bypass -File "%~dp0../../scripts/api/open-api-logs.ps1" -Environment "production"

pause