param(
    [Parameter(Mandatory)]
    [ValidateSet("development", "production", "localhost")]
    [string]$Environment,

    [Parameter(Mandatory)]
    [ValidateSet("android", "ios", "web")]
    [string]$Platform
)
$ErrorActionPreference = "Stop"

. "$PSScriptRoot/../common/lib/console-logger.ps1"
. "$PSScriptRoot/../common/lib/env-editor.ps1"

LogPipelineHeader -Title "Configuring Environment" -Environment $Environment -Application client -Platform $Platform

if ($Platform -eq "android" -and $Environment -ne "localhost") {
    $Settings = @(
        @{
            Key = "PLAYSTORE_VERSION_CODE"
            Prompt = "Playstore Latest Version Code"
        }
    )
}
# TODO: iOS

$ConfigPath = "/etc/pulse/config/client/$Platform/$Environment.env"

ConfigureEnv -ConfigPath $ConfigPath -Settings $Settings

Write-Host "The next build will reflect these changes."

LogPipelineFooter -Title "Configured Environment"