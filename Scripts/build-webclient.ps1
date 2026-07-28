param(
    [Parameter(Mandatory)]
    [ValidateSet("Development", "Production", "Local")]
    [string]$Environment
)

. "$PSScriptRoot/config.ps1"

$Config = Get-EnvironmentConfig -Environment $Environment -Application Web

$ErrorActionPreference = "Stop"

. "$PSScriptRoot/process-start-header.ps1" -Title "Building Pulse $Environment Web Client"


$ProjectRoot = Resolve-Path "$PSScriptRoot/../Frontend - Vanilla Web"

Push-Location $ProjectRoot

try
{
    if (Test-Path "../$($Config.PublishRoot)")
    {
        Remove-Item "../$($Config.PublishRoot)" -Recurse -Force
    }

    npm ci

    if ($LASTEXITCODE -ne 0)
    {
        throw "npm install failed."
    }

    npm run "build:$($Environment.ToLower()):web"

    if ($LASTEXITCODE -ne 0)
    {
        throw "Web publish failed."
    }
}
finally
{
    Pop-Location
}

. "$PSScriptRoot/process-end-header.ps1" -Title "Pulse $Environment Web Client Build Completed"