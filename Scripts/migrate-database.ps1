param(
    [Parameter(Mandatory)]
    [ValidateSet("Development", "Production")]
    [string]$Environment,

    [Parameter(Mandatory)]
    [string]$Release
)

. "$PSScriptRoot/config.ps1"

$Config = Get-EnvironmentConfig -Environment $Environment -Application Api

. "$PSScriptRoot/process-start-header.ps1" -Title "Migrating Database" -Environment $Environment

ssh $Config.Server sudo "/usr/local/bin/pulse-migrate $Environment $Release"

if ($LASTEXITCODE -ne 0)
{
    throw "Migration failed."
}

. "$PSScriptRoot/process-end-header.ps1" -Title "Database Migrated"