param(
    [Parameter(Mandatory)]
    [string]$Environment
)
$ErrorActionPreference = "Stop"

. "$PSScriptRoot/lib/console-logger.ps1"
. "$PSScriptRoot/lib/env-editor.ps1"
. "$PSScriptRoot/lib/run-shell-command.ps1"

LogPipelineHeader -Title "Composing Up" -Environment $Environment

$ConfigPath = (Resolve-Path (Join-Path $PSScriptRoot "../../docker/$Environment.env")).Path

# Registry composed separtely as Core Environment relise on it for its image
$ComposeFile = (Resolve-Path (Join-Path $PSScriptRoot "../../docker/compose-registry.yml")).Path
RunShellCommand `
    -Command "docker compose -f $ComposeFile -p registry-$Environment --env-file '$ConfigPath' up -d --remove-orphans"

LogHeader "Waiting for Registry"

do
{
    Start-Sleep 1

    $Status = RunShellCommand `
        -Command "docker inspect --format '{{.State.Health.Status}}' registry-$Environment-registry-1" `
        -ErrorMessage "Failed to inspect registry."

    Write-Host $Status

    if ($Status.Trim() -eq "healthy")
    {
        break
    }
}
while ($true)

LogFooter "Registry Ready"

# Core Environment
$ComposeFile = (Resolve-Path (Join-Path $PSScriptRoot "../../docker/compose-api.yml")).Path
RunShellCommand `
    -Command "docker compose -f $ComposeFile -p pulse-$Environment --env-file '$ConfigPath' up -d --remove-orphans"


# Nginx Environment
$ComposeFile = (Resolve-Path (Join-Path $PSScriptRoot "../../docker/compose-nginx.yml")).Path
RunShellCommand `
    -Command "docker compose -f $ComposeFile -p nginx-$Environment --env-file '$ConfigPath' up -d --remove-orphans"

LogPipelineFooter -Title "Finished Composing Up"