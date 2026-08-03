param(
    [Parameter(Mandatory)]
    [ValidateSet("development", "production", "localhost")]
    [string]$Environment
    )
    
. "$PSScriptRoot/lib/registry.ps1"
. "$PSScriptRoot/../common/lib/console-logger.ps1"

LogPipelineHeader -Title "Initialize Registry" -Environment $Environment

RegistryInitialize -Environment $Environment

RegistryStart -Environment $Environment

RegistryLog -Environment $Environment

LogPipelineFooter -Title "Registry Initialized"