param(
    [Parameter(Mandatory)]
    [ValidateSet("Development", "Production")]
    [string]$Environment,

    [Parameter(Mandatory)]
    [string]$Release
)

. "$PSScriptRoot/config.ps1"

$Config = Get-EnvironmentConfig -Environment $Environment -Application Api

Write-Host ">>> Migrating ($Environment) Database <<<"

ssh $Config.Server sudo "/usr/local/bin/pulse-migrate $Environment $Release"

if ($LASTEXITCODE -ne 0)
{
    throw "Migration failed."
}