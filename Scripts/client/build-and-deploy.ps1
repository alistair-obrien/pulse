param(
    [Parameter(Mandatory)]
    [ValidateSet("Development","Production")]
    [string]$Environment,

    [Parameter(Mandatory)]
    [ValidateSet("android","ios","web")]
    [string]$Platform
)
$ErrorActionPreference = "Stop"

. "$PSScriptRoot/../common/console-logger.ps1"
. "$PSScriptRoot/build-client.ps1"
. "$PSScriptRoot/package-client.ps1"
. "$PSScriptRoot/deploy-client.ps1"

LogPipelineHeader -Title "Building & Deploying Pulse Client" -Environment $Environment -Platform $Platform

$BuiltPath = BuildClient -Environment $Environment -Platform $Platform
 
$PackageResult = PackageClient -Environment $Environment -Platform $Platform -BuiltPath $BuiltPath

DeployClient -Environment $Environment -Platform $Platform -PackagedResult $PackageResult

LogPipelineFooter -Title "Pulse Client Built & Deployed"