param(
    [Parameter(Mandatory)]
    [ValidateSet("Development", "Production", "Local")]
    [string]$Environment
)

. "$PSScriptRoot/config.ps1"

$Config = Get-EnvironmentConfig -Environment $Environment -Application Api

$ErrorActionPreference = "Stop"

. "$PSScriptRoot/process-start-header.ps1" -Title "Logging ($Environment) Service"

ssh $Config.Server "journalctl -u $($Config.Service) -f"