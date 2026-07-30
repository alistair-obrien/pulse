@echo off

title Build and Run Local Server

setlocal

set "Environment=Local"

powershell.exe -ExecutionPolicy Bypass -File "%~dp0../../scripts/server/build-server.ps1" -Environment "%Environment%"

if ($LASTEXITCODE -ne 0)
{
    throw "!!! Build failed."
}

& "$PSScriptRoot/migrate-database.ps1" -Environment $Environment -Release $Release

if ($LASTEXITCODE -ne 0)
{
    throw "!!! Migration failed."
}

& "$PSScriptRoot/restart-server.ps1" -Environment $Environment

pause