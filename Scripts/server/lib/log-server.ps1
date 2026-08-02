function LogServer {
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
    . "$PSScriptRoot/../../common/lib/invoke-remote.ps1"

    $Config = Get-EnvironmentConfig -Environment $Environment -Application $Application

    $ErrorActionPreference = "Stop"

    LogHeader -Title "Connecting to Docker logs" -Environment $Environment
    
    InvokeRemote `
        -Server $Config.Server `
        -Command "sudo docker logs --tail 100 -f pulse-$Application-$Environment" `
        -ErrorMessage "Failed to connect to Docker logs."   
}