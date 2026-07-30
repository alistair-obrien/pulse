@echo off

title Deploy Development Web Client

powershell.exe ^
    -ExecutionPolicy Bypass ^
    -File "%~dp0../../scripts/client/build-and-deploy.ps1" ^
    -Environment development ^
    -Platform web

pause