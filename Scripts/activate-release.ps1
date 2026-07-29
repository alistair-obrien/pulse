param(
    [Parameter(Mandatory)]
    [ValidateSet("Development", "Production")]
    [string]$Environment,

    [Parameter(Mandatory)]
    [ValidateSet("Api", "Web")]
    [string]$Application,

    [Parameter(Mandatory)]
    [string]$Release
)

. "$PSScriptRoot/config.ps1"

$Config = Get-EnvironmentConfig -Environment $Environment -Application $Application

$ErrorActionPreference = "Stop"

$Current = $Config.CurrentRoot
$Target = "$($Config.ReleaseRoot)/$Release"

. "$PSScriptRoot/process-start-header.ps1" -Title "Activating $API Release $Target $Release" -Environment $Environment

ssh $Config.Server "ln -sfn '$Target' '$Current'"

if ($LASTEXITCODE -ne 0)
{
    throw "Failed to activate release."
}

. "$PSScriptRoot/process-end-header.ps1" -Title "$API Release $Target $Release Activated"