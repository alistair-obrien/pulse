@echo off
setlocal

title Deploy Development API

powershell.exe -ExecutionPolicy Bypass -File "%~dp0../scripts/common/compose-up.ps1"

pause