function LogServer {
    param(
        [Parameter(Mandatory)]
        [ValidateSet("development", "production", "localhost")]
        [string]$Environment
    )

    . "$PSScriptRoot/../../common/lib/config.ps1"
    . "$PSScriptRoot/../../common/lib/console-logger.ps1"

    $Config = Get-EnvironmentConfig -Environment $Environment -Application api

    $ErrorActionPreference = "Stop"

    LogHeader -Title "Connecting to logs" -Environment $Environment

    ssh $Config.Server "journalctl -u $($Config.Service) -f"
}