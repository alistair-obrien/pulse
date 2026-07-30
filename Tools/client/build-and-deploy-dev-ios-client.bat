@echo off

title Deploy Development iOS Client

powershell.exe ^
    -ExecutionPolicy Bypass ^
    -File "%~dp0../../scripts/client/build-and-deploy.ps1" ^
    -Environment development ^
    -Platform ios

pause