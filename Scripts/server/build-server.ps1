function BuildServer
{
    param(
        [Parameter(Mandatory)]
        [ValidateSet("development", "production", "local")]
        [string]$Environment
    )
    $ErrorActionPreference = "Stop"

    . "$PSScriptRoot/../common/config.ps1"
    . "$PSScriptRoot/../common/console-logger.ps1"

    $Config = Get-EnvironmentConfig -Environment $Environment -Application api

    LogHeader -Title "Building Pulse API" -Environment $Environment

    $SolutionRoot = Resolve-Path "$PSScriptRoot/../../Backend - dot NET EFCore"

    $Project = Join-Path $SolutionRoot "Pulse.Api"
    $Publish = "$PSScriptRoot/../../$($Config.PublishRoot)"

    if (Test-Path $Publish)
    {
        Remove-Item $Publish -Recurse -Force
    }

    # Publish the application first
    dotnet publish `
        $Project `
        --configuration Release `
        --output $Publish ` | Out-Host

    if ($LASTEXITCODE -ne 0)
    {
        throw "Publish failed."
    }

    LogFooter -Title "API Built"

    return $Publish
}
