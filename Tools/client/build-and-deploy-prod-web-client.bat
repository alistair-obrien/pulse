@echo off

title Deploy Production Web Client

powershell.exe ^
    -ExecutionPolicy Bypass ^
    -File "%~dp0../../scripts/client/build-and-deploy.ps1" ^
    -Environment production ^
    -Platform web

pause