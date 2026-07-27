param(
    [Parameter(Mandatory)]
    [ValidateSet("Development", "Production", "Local")]
    [string]$Environment
)

. "$PSScriptRoot/config.ps1"

$Config = Get-EnvironmentConfig -Environment $Environment -Application Api

$ErrorActionPreference = "Stop"
Write-Host ">>> Restarting ($Environment) Service <<<"

ssh $Config.Server "sudo systemctl restart $($Config.Service)"