param(
    [Parameter(Mandatory)]
    [ValidateSet("development", "production")]
    [string]$Environment,

    [Parameter(Mandatory)]
    [ValidateSet("android","ios","web")]
    [string]$Platform
)
$ErrorActionPreference = "Stop"

. "$PSScriptRoot/../common/lib/console-logger.ps1"
. "$PSScriptRoot/lib/build-client.ps1"
. "$PSScriptRoot/lib/package-client.ps1"
. "$PSScriptRoot/lib/deploy-client.ps1"

LogPipelineHeader -Title "Building & Deploying Pulse Client" -Environment $Environment -Platform $Platform

$BuiltPath = BuildClient -Environment $Environment -Platform $Platform -CleanInstall
 
$PackageResult = PackageClient -Environment $Environment -Platform $Platform -BuiltPath $BuiltPath

DeployClient -Environment $Environment -Platform $Platform -PackagedResult $PackageResult

LogPipelineFooter -Title "Pulse Client Built & Deployed"