param(
    [Parameter(Mandatory)]
    [ValidateSet("development", "production", "local")]
    [string]$Environment,

    [switch]$Pipeline
)
$ErrorActionPreference = "Stop"

. "$PSScriptRoot/log-server.ps1"
. "$PSScriptRoot/../common/console-logger.ps1"

LogPipelineHeader -Title "Logging Server Service" -Environment $Environment
LogServer -Environment $Environment