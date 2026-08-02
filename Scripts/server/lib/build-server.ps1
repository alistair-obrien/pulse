
# Builds the API into the /public folder of the project root
# Can uyse docker or be run locally depending on the environment configuration
function BuildServer
{
    param(
        [Parameter(Mandatory)]
        [ValidateSet("development", "production", "localhost")]
        [string]$Environment
    )
    $ErrorActionPreference = "Stop"

    . "$PSScriptRoot/../../common/lib/config.ps1"
    . "$PSScriptRoot/../../common/lib/console-logger.ps1"
    . "$PSScriptRoot/../../common/lib/docker.ps1"

    $Config = Get-EnvironmentConfig -Environment $Environment -Application api

    LogHeader -Title "Building Pulse API" -Environment $Environment
    
    $ProjectRoot = Resolve-Path "$PSScriptRoot/../../../"
    $SolutionRoot = Resolve-Path "$ProjectRoot/pulse.api"

    $Project = Join-Path $SolutionRoot "Pulse.Api"
    $Publish = "$ProjectRoot/$($Config.PublishRoot)"


    if (Test-Path $Publish)
    {
        Remove-Item $Publish -Recurse -Force
        New-Item -ItemType Directory -Path $Publish -Force | Out-Null
    }

    if ($Config.UseDocker)
    {
        # Build inside a docker container to ensure a consistent build environment
        InvokeDockerBuilder `
            -Source $SolutionRoot `
            -Publish $Publish `
            -Image pulse-api-builder `
            -Command @(
                "dotnet"
                "publish"
                "Pulse.Api/Pulse.Api.csproj"
                "--configuration"
                "Release"
                "--output"
                "/publish"
            )
    }
    else
    {
        dotnet publish `
            $Project `
            --configuration Release `
            --output $Publish `
            | Out-Host

        if ($LASTEXITCODE -ne 0)
        {
            throw "Local Publish failed."
        }
    }

    LogFooter -Title "API Built"

    return $Publish
}
