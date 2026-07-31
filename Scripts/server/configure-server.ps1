param(
    [Parameter(Mandatory)]
    [ValidateSet("development", "production", "localhost")]
    [string]$Environment
)
$ErrorActionPreference = "Stop"

. "$PSScriptRoot/../common/lib/console-logger.ps1"
. "$PSScriptRoot/../common/lib/env-editor.ps1"
. "$PSScriptRoot/lib/restart-server.ps1"
. "$PSScriptRoot/lib/log-server.ps1"

LogPipelineHeader -Title "Configuring Environment" -Environment $Environment -Application api -Platform $Platform

$Settings = @(
    @{
        Key = "ASPNETCORE_URLS"
        Prompt = "ASP.NET URLs"
    },
    @{
        Key = "ASPNETCORE_ENVIRONMENT"
        Prompt = "ASP.NET Environment"
    },
    @{
        Key = "Logging__LogLevel__Default"
        Prompt = "Log Level"
    },
    @{
        Key = "ConnectionStrings__Pulse"
        Prompt = "Postgres Connection String"
    },
    @{
        Key = "Jwt__Key"
        Prompt = "JWT Key"
        # Secret = $true
    },
    @{
        Key = "Jwt__Issuer"
        Prompt = "JWT Issuer"
    },
    @{
        Key = "Jwt__Audience"
        Prompt = "JWT Audience"
    },
    @{
        Key = "Jwt__ExpiryInMinutes"
        Prompt = "JWT Expiry (minutes)"
    }
)

$ConfigPath = "/etc/pulse/config/api/$Environment.env"

ConfigureEnv -ConfigPath $ConfigPath -Settings $Settings

RestartServer -Environment $Environment
LogServer -Environment $Environment

LogPipelineFooter -Title "Configured Environment"