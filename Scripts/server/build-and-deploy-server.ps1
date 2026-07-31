param(
    [Parameter(Mandatory)]
    [ValidateSet("development", "production")]
    [string]$Environment
)

. "$PSScriptRoot/../common/lib/config.ps1"
. "$PSScriptRoot/../common/lib/console-logger.ps1"
. "$PSScriptRoot/lib/restart-server.ps1"
. "$PSScriptRoot/lib/log-server.ps1"
. "$PSScriptRoot/../common/lib/upload-release.ps1"
. "$PSScriptRoot/lib/migrate-database.ps1" 
. "$PSScriptRoot/../common/lib/activate-release.ps1"
. "$PSScriptRoot/lib/build-server.ps1"

$ErrorActionPreference = "Stop"

LogPipelineHeader -Title "Building & Deploying Pulse API" -Environment $Environment

$BuiltPath = BuildServer -Environment $Environment
Write-Host "Built Path:" $BuiltPath 

$Release = UploadRelease -Environment $Environment -Application api -SourcePath $BuiltPath

MigrateDatabase -Environment $Environment -Release $Release

ActivateRelease -Environment $Environment -Application api -Release $Release 

RestartServer -Environment $Environment

LogServer -Environment $Environment

LogPipelineFooter -Title "Server Built & Deployed Pulse API"