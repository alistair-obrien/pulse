function LogAPI {
    param(
        [Parameter(Mandatory)]
        [ValidateSet("development", "production", "localhost")]
        [string]$Environment,
        
        [Parameter(Mandatory)]
        [ValidateSet("api")]
        [string]$Application
    )

    . "$PSScriptRoot/../../common/lib/config.ps1"
    . "$PSScriptRoot/../../common/lib/console-logger.ps1"
    . "$PSScriptRoot/../../common/lib/docker.ps1"

    $Config = Get-EnvironmentConfig -Environment $Environment -Application $Application

    $ErrorActionPreference = "Stop"

    LogHeader -Title "Connecting to Docker logs" -Environment $Environment
    
    DockerLogContainer `
        -Server $Config.Server `
        -Container "pulse-$Application-$Environment"
}