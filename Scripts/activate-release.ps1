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

Write-Host ""
Write-Host ">>> Activating Release $Target <<<"

. "$PSScriptRoot/process-start-header.ps1" -Title "Activating $Environment $API Release $Target $Release"

ssh $Config.Server "ln -sfn '$Target' '$Current'"

if ($LASTEXITCODE -ne 0)
{
    throw "Failed to activate release."
}

. "$PSScriptRoot/process-end-header.ps1" -Title "Activated $Environment $API Release $Target $Release"