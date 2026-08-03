param(
    [Parameter(Mandatory)]
    [string]$Environment
)
$ErrorActionPreference = "Stop"

. "$PSScriptRoot/lib/console-logger.ps1"
. "$PSScriptRoot/lib/run-shell-command.ps1"

LogPipelineHeader -Title "Viewing Logs" -Environment $Environment

$ComposeFile = (Resolve-Path (Join-Path $PSScriptRoot "../../docker/compose.yml")).Path
$ConfigPath = (Resolve-Path (Join-Path $PSScriptRoot "../../docker/$Environment.env")).Path

RunShellCommand `
    -Command {
        param($ComposeFile, $Environment, $ConfigPath)

        docker compose `
            -f "$ComposeFile" `
            -p pulse-localhost `
            --env-file "$ConfigPath" `
            ps | Out-Host

        docker compose `
            -f "$ComposeFile" `
            -p pulse-localhost `
            --env-file "$ConfigPath" `
            logs -f api | Out-Host
    } `
    -ArgumentList $ComposeFile, $Environment, $ConfigPath `
    -ErrorMessage "Failed to view Pulse logs."

LogPipelineFooter -Title "Finished Viewing Logs"