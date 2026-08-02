
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

    LogHeader -Title "Building Pulse API" -Environment $Environment
    
    $BuildResult = DockerBuildImage `
        -Dockerfile "docker/api/Dockerfile" `
        -Context "pulse.api" `
        -Image "pulse-api:$Environment" `

    LogFooter -Title "Pulse API Built"

    return $BuildResult
}