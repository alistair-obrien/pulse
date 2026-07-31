@echo off
setlocal

title Live Reload Vite

powershell.exe -ExecutionPolicy Bypass -File "%~dp0../../scripts/client/live-reload-client.ps1" -Environment "localhost" -Platform "android"

pause