param(
    [Parameter(Mandatory)]
    [ValidateSet("development", "production")]
    [string]$Environment
)

. "$PSScriptRoot/../common/config.ps1"
. "$PSScriptRoot/../common/console-logger.ps1"
. "$PSScriptRoot/restart-server.ps1"
. "$PSScriptRoot/log-server.ps1"
. "$PSScriptRoot/../common/upload-release.ps1"
. "$PSScriptRoot/migrate-database.ps1" 
. "$PSScriptRoot/../common/activate-release.ps1"
. "$PSScriptRoot/build-server.ps1"

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