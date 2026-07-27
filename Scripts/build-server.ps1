param(
    [Parameter(Mandatory)]
    [ValidateSet("Development", "Production", "Local")]
    [string]$Environment
)

. "$PSScriptRoot/config.ps1"

$Config = Get-EnvironmentConfig -Environment $Environment -Application Api

$ErrorActionPreference = "Stop"
Write-Host ">>> Building Pulse API ($Environment) <<<"

$SolutionRoot = Resolve-Path "$PSScriptRoot/../Backend - dot NET EFCore"

Write-Host $Config.PublishRoot

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

Write-Host ""
Write-Host "Publish completed."
Write-Host "Environment: $Environment"
Write-Host "Output: $Publish"