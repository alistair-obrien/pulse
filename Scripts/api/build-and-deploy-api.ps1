param(
    [Parameter(Mandatory)]
    [string]$Environment
)

. "$PSScriptRoot/../common/lib/console-logger.ps1"
. "$PSScriptRoot/../common/lib/publish-package.ps1"
. "$PSScriptRoot/../common/lib/activate-release.ps1"
. "$PSScriptRoot/lib/build-api.ps1"
. "$PSScriptRoot/lib/log-api.ps1"

$ErrorActionPreference = "Stop"

$RepoRoot = "$PSScriptRoot/../.."
Push-Location -Path $RepoRoot

Write-Host $pwd

try 
{
    LogPipelineHeader -Title "Building & Deploying Pulse API" -Environment $Environment -Application api

    # Docker Builds an Image
    $BuildResult = BuildAPI -Environment $Environment 

    # Docker Publishes the Image to the Registry
    $PublishedPackage = PublishPackage -Package $BuildResult -Environment $Environment # Add registry to publish to so local builds can be in a local registry

    # We tell the server to pull the new image and restart the container
    ActivateRelease -Environment $Environment -Application api -PublishedPackage $PublishedPackage 

    # We open a log stream to the server container
    LogAPI -Environment $Environment -Application api

    LogPipelineFooter -Title "Pulse API Built & Deployed"
}
finally 
{
    Pop-Location
}


# # # OBSOLETE
# This will be managed by docker now
# . "$PSScriptRoot/lib/migrate-database.ps1"
# MigrateDatabase -Environment $Environment -Release $PublishedPackage


# Docker does the build and packaging now
# . "$PSScriptRoot/../common/lib/package-release.ps1"
# $PackagedRelease = PackageRelease -Environment $Environment -Application api -SourcePath $BuiltPath