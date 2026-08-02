@echo off
setlocal

title Deploy Dev Database

powershell.exe -ExecutionPolicy Bypass -File "%~dp0../../scripts/database/deploy-postgres-db.ps1" -Environment "development"

pause