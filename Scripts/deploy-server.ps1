param(
    [Parameter(Mandatory)]
    [ValidateSet("Development", "Production")]
    [string]$Environment
)

. "$PSScriptRoot/config.ps1"

$Config = Get-EnvironmentConfig -Environment $Environment -Application Api

$ErrorActionPreference = "Stop"

. "$PSScriptRoot/process-start-header.ps1" -Title "Deploying Server" -Environment $Environment

& "$PSScriptRoot/build-server.ps1" -Environment $Environment

if ($LASTEXITCODE -ne 0)
{
    throw "!!! Build failed."
}

$Release = & "$PSScriptRoot/upload-release.ps1" -Environment $Environment -Application Api

if ($LASTEXITCODE -ne 0)
{
    throw "!!! Upload failed."
}

& "$PSScriptRoot/migrate-database.ps1" -Environment $Environment -Release $Release

if ($LASTEXITCODE -ne 0)
{
    throw "!!! Migration failed."
}

& "$PSScriptRoot/activate-release.ps1" -Environment $Environment -Application Api -Release $Release 

if ($LASTEXITCODE -ne 0)
{
    throw "!!! Activation failed."
}

& "$PSScriptRoot/restart-server.ps1" -Environment $Environment

& "$PSScriptRoot/log-server.ps1" -Environment $Environment

. "$PSScriptRoot/process-end-header.ps1" -Title "Server Deployed"