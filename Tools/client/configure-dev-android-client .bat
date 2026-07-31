@echo off
setlocal

title Deploy Development Server

powershell.exe -ExecutionPolicy Bypass -File "%~dp0../../scripts/client/configure-client.ps1" -Environment "development" -Platform "android"

pause