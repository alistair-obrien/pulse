param(
    [Parameter(Mandatory)]
    [ValidateSet("development", "production", "localhost")]
    [string]$Environment,

    [string]$Server
    )
    
. "$PSScriptRoot/lib/registry.ps1"
. "$PSScriptRoot/../common/lib/console-logger.ps1"

LogPipelineHeader -Title "Initialize Registry" -Environment $Environment

RegistryInitialize -Environment $Environment -Server $Server

RegistryStart -Environment $Environment -Server $Server

RegistryLog -Environment $Environment -Server $Server

LogPipelineFooter -Title "Registry Initialized"