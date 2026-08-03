@echo off
setlocal

title Deploy Development API

powershell.exe -ExecutionPolicy Bypass -File "%~dp0../scripts/common/compose-down.ps1"

pause