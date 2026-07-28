param(
    [Parameter(Mandatory)]
    [ValidateSet("Development", "Production", "Local")]
    [string]$Environment
)

. "$PSScriptRoot/config.ps1"

$Config = Get-EnvironmentConfig -Environment $Environment -Application Api

$ErrorActionPreference = "Stop"
. "$PSScriptRoot/process-start-header.ps1" -Title "Restarting ($Environment) Server"

ssh $Config.Server "sudo systemctl restart $($Config.Service)"

if ($LASTEXITCODE -ne 0)
{
    throw "Restart failed."
}

. "$PSScriptRoot/process-end-header.ps1" -Title "Restarted ($Environment) Server"