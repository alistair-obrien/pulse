param(
    [Parameter(Mandatory)]
    [ValidateSet("development", "production")]
    [string]$Environment
)

. "$PSScriptRoot/../common/lib/console-logger.ps1"
. "$PSScriptRoot/../common/lib/config.ps1"
. "$PSScriptRoot/../common/lib/package-release.ps1"
. "$PSScriptRoot/../common/lib/publish-package.ps1"
. "$PSScriptRoot/../common/lib/activate-release.ps1"
. "$PSScriptRoot/lib/build-server.ps1"
. "$PSScriptRoot/lib/migrate-database.ps1" 
. "$PSScriptRoot/lib/log-server.ps1"

$ErrorActionPreference = "Stop"

LogPipelineHeader -Title "Building & Deploying Pulse API" -Environment $Environment

$BuiltPath = BuildServer -Environment $Environment 

$PackagedRelease = PackageRelease -Environment $Environment -Application api -SourcePath $BuiltPath

$PublishedPackage = PublishPackage -Environment $Environment -Application api -Package $PackagedRelease
    
# MigrateDatabase -Environment $Environment -Release $PublishedPackage

ActivateRelease -Environment $Environment -Application api -PublishedPackage $PublishedPackage 

LogServer -Environment $Environment -Application api

LogPipelineFooter -Title "Pulse API Built & Deployed"