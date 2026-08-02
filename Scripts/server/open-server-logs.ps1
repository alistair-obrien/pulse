param(
    [Parameter(Mandatory)]
    [ValidateSet("development", "production", "localhost")]
    [string]$Environment
)
$ErrorActionPreference = "Stop"


. "$PSScriptRoot/lib/log-server.ps1"
. "$PSScriptRoot/../common/lib/console-logger.ps1"

LogPipelineHeader -Title "Logging Server Service" -Environment $Environment
LogServer -Environment $Environment -Application api