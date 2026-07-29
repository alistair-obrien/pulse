param(
    [Parameter(Mandatory)]
    [ValidateSet("Development", "Production", "Local")]
    [string]$Environment
)

. "$PSScriptRoot/config.ps1"

$Config = Get-EnvironmentConfig -Environment $Environment -Application Api

$ErrorActionPreference = "Stop"

. "$PSScriptRoot/process-start-header.ps1" -Title "Building Pulse Api" -Environment $Environment

$SolutionRoot = Resolve-Path "$PSScriptRoot/../Backend - dot NET EFCore"


$Project = Join-Path $SolutionRoot "Pulse.Api"
$Publish = "$PSScriptRoot/../$($Config.PublishRoot)"

if (Test-Path $Publish)
{
    Remove-Item $Publish -Recurse -Force
}

# Publish the application first
dotnet publish `
    $Project `
    --configuration Release `
    --output $Publish `

if ($LASTEXITCODE -ne 0)
{
    throw "Publish failed."
}

. "$PSScriptRoot/process-end-header.ps1" -Title "API Built"