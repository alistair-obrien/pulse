param(
    [Parameter(Mandatory)]
    [string]$Environment
)
$ErrorActionPreference = "Stop"

. "$PSScriptRoot/lib/console-logger.ps1"
. "$PSScriptRoot/lib/run-shell-command.ps1"

LogPipelineHeader -Title "Composing Down" -Environment $Environment

$ConfigPath = (Resolve-Path (Join-Path $PSScriptRoot "../../docker/$Environment.env")).Path

# NGINX Proxy
$ComposeFile = (Resolve-Path (Join-Path $PSScriptRoot "../../docker/compose-nginx.yml")).Path
RunShellCommand `
    -Command "docker compose -f '$ComposeFile' -p nginx-$Environment --env-file '$ConfigPath' down" `
    -ErrorMessage "Failed to stop NGINX."

# Core Environment
$ComposeFile = (Resolve-Path (Join-Path $PSScriptRoot "../../docker/compose-api.yml")).Path
RunShellCommand `
    -Command "docker compose -f '$ComposeFile' -p pulse-$Environment --env-file '$ConfigPath' down" `
    -ErrorMessage "Failed to stop Registry."

# Registry
$ComposeFile = (Resolve-Path (Join-Path $PSScriptRoot "../../docker/compose-registry.yml")).Path
RunShellCommand `
    -Command "docker compose -f '$ComposeFile' -p registry-$Environment --env-file '$ConfigPath' down" `
    -ErrorMessage "Failed to stop Pulse."

# Stop network

LogPipelineFooter -Title "Finished Composing Down"