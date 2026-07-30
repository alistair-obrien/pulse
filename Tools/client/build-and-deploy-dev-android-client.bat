@echo off

title Deploy Development Android Client

powershell.exe ^
    -ExecutionPolicy Bypass ^
    -File "%~dp0../../scripts/client/build-and-deploy.ps1" ^
    -Environment development ^
    -Platform android

pause