function BuildClient {
    param(
        [Parameter(Mandatory)]
        [ValidateSet("localhost", "development", "production")]
        [string]$Environment,

        [Parameter(Mandatory)]
        [ValidateSet("android","ios","web")]
        [string]$Platform,

        [switch]$CleanInstall
    )
    $ErrorActionPreference = "Stop"

    . "$PSScriptRoot/../../common/lib/console-logger.ps1"
    . "$PSScriptRoot/../../common/lib/docker.ps1"

    LogHeader -Title "Building Pulse Client" -Environment $Environment

    $BuildResult = DockerBuildImage `
        -Dockerfile "$RepoRoot/docker/client/Dockerfile" `
        -Context $RepoRoot/pulse.client `
        -Image "pulse-client-builder" `
        -BuildArgs @{
            Environment   = $Environment
            Platform      = $Platform
            CleanInstall  = $CleanInstall.IsPresent
        }

    LogFooter -Title "Pulse Client Built"

    return $BuildResult
}