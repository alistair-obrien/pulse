@echo off
setlocal

set "Environment=Local"

powershell.exe -ExecutionPolicy Bypass -File "%~dp0../Scripts/build.ps1" -Environment "%Environment%"

pause