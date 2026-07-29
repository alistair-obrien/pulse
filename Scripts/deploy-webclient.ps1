param(
    [Parameter(Mandatory)]
    [ValidateSet("Development", "Production")]
    [string]$Environment
)

. "$PSScriptRoot/config.ps1"

$Config = Get-EnvironmentConfig -Environment $Environment -Application Web

$ErrorActionPreference = "Stop"

. "$PSScriptRoot/process-start-header.ps1" -Title "Deploying Web Client" -Environment $Environment 

& "$PSScriptRoot/build-webclient.ps1" -Environment $Environment

if ($LASTEXITCODE -ne 0)
{
    throw "!!! Build failed."
}

$Release = & "$PSScriptRoot/upload-release.ps1" -Environment $Environment -Application Web

if ($LASTEXITCODE -ne 0)
{
    throw "!!! Upload failed."
}

& "$PSScriptRoot/activate-release.ps1" -Environment $Environment -Application Web -Release $Release

if ($LASTEXITCODE -ne 0)
{
    throw "!!! Activation failed."
}

. "$PSScriptRoot/process-end-header.ps1" -Title "Web Client Deployed"