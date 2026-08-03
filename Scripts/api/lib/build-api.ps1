
# Builds the API into the /public folder of the project root
# Can uyse docker or be run locally depending on the environment configuration
function BuildAPI
{
    param(
        [Parameter(Mandatory)]
        [ValidateSet("development", "production", "localhost")]
        [string]$Environment
    )
    $ErrorActionPreference = "Stop"

    . "$PSScriptRoot/../../common/lib/console-logger.ps1"
    . "$PSScriptRoot/../../common/lib/docker.ps1"
    . "$PSScriptRoot/../../common/lib/env-editor.ps1"
    
    $RepoRoot = "$PSScriptRoot/../../.."

    # First get the environments config
    $EnvConfig = ReadEnvFile -File "$RepoRoot/docker/$Environment.env"

    $ProjectRoot = Resolve-Path -Path "$PSScriptRoot/../../../"

    LogHeader -Title "Building Pulse API" -Environment $Environment
    
    $BuildResult = DockerBuildImage `
        -Dockerfile "$ProjectRoot/docker/api/Dockerfile" `
        -Context "$ProjectRoot/pulse.api" `
        -Image $($EnvConfig.API_IMAGE) `

    LogFooter -Title "Pulse API Built"

    return $BuildResult
}