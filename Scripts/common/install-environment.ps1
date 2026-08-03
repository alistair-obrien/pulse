param(
    [Parameter(Mandatory)]
    [string]$Environment
)
$ErrorActionPreference = "Stop"

. "$PSScriptRoot/lib/console-logger.ps1"
. "$PSScriptRoot/lib/env-editor.ps1"
. "$PSScriptRoot/lib/run-shell-command.ps1"

LogPipelineHeader -Title "Hello" -Environment $Environment

# Find the .env file.
# If not found, create a new one and prompt for Config

# Write-Host "No .env found for $Environment"
# Write-Host "Create a new Environment? [Y(es)|N(o)]"
# $Action = Read-Host
# if ($Action -ne 'Y')
# {
#     Write-Host "Nothing done."
#     return
# }

$Settings = @(
    @{
        Key    = "NAME"
        Prompt = "Environment Name."
    },
    @{
        Key    = "NGINX_HOME"
        Prompt = "NGINX data/config directory."
    },
    @{
        Key    = "PULSE_HOME"
        Prompt = "Pulse data/config directory."
    },
    @{
        Key    = "REGISTRY_HOME"
        Prompt = "Registry data/config directory."
    },
    @{
        Key    = "API_HOST"
        Prompt = "API hostname."
    },
    @{
        Key    = "WEB_CLIENT_HOST"
        Prompt = "Web client hostname."
    },
    @{
        Key    = "REGISTRY_HOST"
        Prompt = "Docker registry hostname."
    },
    @{
        Key    = "REGISTRY_PORT"
        Prompt = "Docker registry port."
    },
    @{
        Key    = "API_IMAGE"
        Prompt = "API image name and tag."
    }
)

$ConfigPath = (Resolve-Path (Join-Path $PSScriptRoot "../../docker/$Environment.env")).Path
#  | Resolve-Path

$Config = ConfigureEnv -ConfigPath $ConfigPath -Settings $Settings

LogHeader "Building Persistent Directory"

$PulseHome = $Config.PULSE_HOME
$RegistryHome = $Config.REGISTRY_HOME
$NginxHome = $Config.NGINX_HOME

# TODO: Prompt for SSH or LocalHost as the host
# TODO: If installation was already found, prompt to delete and recreate it

RunShellCommand `
    -Command "if (Test-Path '$NginxHome') { Remove-Item '$NginxHome' -Recurse -Force }" `
    -ErrorMessage "Failed to remove existing NGINX directory."

RunShellCommand `
    -Command "New-Item -ItemType Directory -Path '$NginxHome' | Out-Null" `
    -ErrorMessage "Failed to create NGINX directory."

RunShellCommand `
    -Command "if (Test-Path '$RegistryHome') { Remove-Item '$RegistryHome' -Recurse -Force }" `
    -ErrorMessage "Failed to remove existing Registry directory."

RunShellCommand `
    -Command "New-Item -ItemType Directory -Path '$RegistryHome' | Out-Null" `
    -ErrorMessage "Failed to create Registry directory."

RunShellCommand `
    -Command "if (Test-Path '$PulseHome') { Remove-Item '$PulseHome' -Recurse -Force }" `
    -ErrorMessage "Failed to remove existing Pulse directory."

RunShellCommand `
    -Command "New-Item -ItemType Directory -Path '$PulseHome' | Out-Null" `
    -ErrorMessage "Failed to create Pulse directory."

$Directories = @(
    # Registry   
    "$RegistryHome/config"
    "$RegistryHome/config/registry"
    "$RegistryHome/data"
    "$RegistryHome/data/registry"

    # Pulse
    "$PulseHome/config"    
    "$PulseHome/config/api"
    "$PulseHome/config/postgres"
    "$PulseHome/data"
    "$PulseHome/data/postgres"

    # NGINX
    "$NginxHome/config"
    "$NginxHome/config/certs"
    "$NginxHome/config/conf.d"
    "$NginxHome/html"
)

$Files = @(
    # Registry
    #     Nothing
    
    # Pulse
    "$PulseHome/config/api/api.env"
    "$PulseHome/config/postgres/postgres.env"
    
    # Nginx
    "$NginxHome/config/nginx.conf"
    "$NginxHome/config/conf.d/api.conf"
    "$NginxHome/config/conf.d/registry.conf"
    "$NginxHome/config/conf.d/web.conf"
)

foreach ($directory in $Directories)
{
    RunShellCommand `
        -Command "New-Item -ItemType Directory -Path '$directory' -Force | Out-Null" `
        -ErrorMessage "Failed to create directory '$directory'."
}

foreach ($file in $Files)
{
    RunShellCommand `
        -Command "if (-not (Test-Path '$file')) { New-Item -ItemType File -Path '$file' | Out-Null }" `
        -ErrorMessage "Failed to create file '$file'."
}

# >>> NETWORKS <<<
LogHeader "Creating Networks"

$Networks = @(
    "pulse-$($Config.Name)"
    "registry-$($Config.Name)"
)

foreach ($Network in $Networks)
{
    $Exists = docker network ls --format "{{.Name}}" |
        Where-Object { $_ -eq $Network }

    if (-not $Exists)
    {
        RunShellCommand `
            -Command { docker network create $Network } `
            -ArgumentList $Network `
            -ErrorMessage "Failed to create Docker network '$Network'."
    }
}

# >>> REGISTRY <<<
LogHeader "Creating Registry"
. "$PSScriptRoot../../registry/lib/registry.ps1"
RegistryInitialize -PulseHome $RegistryHome -RegistryHost $Config.REGISTRY_HOST

# >>> POSTGRES <<<
LogHeader "Configure PostgreSQL"

$PostgresSettings = @(
    @{
        Key = "POSTGRES_DB"
        Prompt = "PostgreSQL database."
        Default = "pulse"
    },
    @{
        Key = "POSTGRES_USER"
        Prompt = "PostgreSQL username."
    },
    @{
        Key = "POSTGRES_PASSWORD"
        Prompt = "PostgreSQL password."
        Secret = $true
    }
)

# Configures the Postgres Env
$PostgresConfig = ConfigureEnv `
    -ConfigPath "$PulseHome/config/postgres/postgres.env" `
    -Settings $PostgresSettings

LogHeader "Starting PostgreSQL"

$ComposeFile = Resolve-Path (Join-Path $PSScriptRoot "../../docker/compose-api.yml")

Push-Location (Join-Path $PSScriptRoot "../../docker")
try 
{
    RunShellCommand `
    -Command "docker compose -f $ComposeFile --env-file '$ConfigPath' up -d postgres" `
    -ErrorMessage "Failed to start PostgreSQL."
    
}
finally 
{
}

LogHeader "Waiting for PostgreSQL"
do
{
    Start-Sleep -Seconds 1

    try
    {
        RunShellCommand `
            -Command "docker compose -f $ComposeFile --env-file '$ConfigPath' exec postgres pg_isready" `
            -ErrorMessage "PostgreSQL is not ready."

        break
    }
    catch
    {
    }
}
while ($true)

# >>> Get Connection String for ASP Net <<<
$ConnectionString = "Host=postgres;Port=5432;Database=$($PostgresConfig.POSTGRES_DB);Username=$($PostgresConfig.POSTGRES_USER);Password=$($PostgresConfig.POSTGRES_PASSWORD)"
$JwtKey = [Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))

# >>> ASPNET CORE CONFIG <<<
$AspNetCoreEnvConfig = [ordered]@{
    ASPNETCORE_ENVIRONMENT     = $Environment
    ConnectionStrings__Pulse   = $ConnectionString
    Jwt__Audience              = "pulse"
    Jwt__Issuer                = "pulse"
    Jwt__ExpiryInMinutes       = "10080"
    Jwt__Key                   = $JwtKey
    Logging__LogLevel__Default = "Information"
}

WriteEnvFile `
    -File "$PulseHome/config/api/api.env" `
    -Config $AspNetCoreEnvConfig `
    -Server $Server `



# CERT
$CertDirectory = "$NginxHome/config/certs"
$KeyPath  = "$CertDirectory/domain.key"
$CertPath = "$CertDirectory/domain.crt"
RunShellCommand `
    -Command {
        docker run --rm `
            -v "${CertDirectory}:/certs" `
            alpine/openssl `
            req -x509 -nodes -days 3650 `
            -newkey rsa:2048 `
            -keyout /certs/domain.key `
            -out /certs/domain.crt `
            -subj "/CN=localhost"
    } `
    -ArgumentList $KeyPath, $CertPath `
    -ErrorMessage "Failed to create self signed certificate."

#
# >>> NGINX <<<
#
# >>> nginx
$NginxConfig = @"
events {}

http {
    include /etc/nginx/conf.d/*.conf;
}
"@
Set-Content `
    -Path "$NginxHome/config/nginx.conf" `
    -Value $NginxConfig

# >>> api
$NginxAPIConfig = @"
server {
    listen 443 ssl;
    server_name $($Config.API_HOST);

    ssl_certificate     /etc/nginx/certs/domain.crt;
    ssl_certificate_key /etc/nginx/certs/domain.key;

    location / {
        proxy_pass http://api:8080;
    }
}
"@
Set-Content `
    -Path "$NginxHome/config/conf.d/api.conf" `
    -Value $NginxAPIConfig

# >>> registry
$NginxRegistryConfig = @"
server {
    listen 443 ssl;
    server_name $($Config.REGISTRY_HOST);

    ssl_certificate     /etc/nginx/certs/domain.crt;
    ssl_certificate_key /etc/nginx/certs/domain.key;

    location / {
        proxy_pass http://registry:5000;
    }
}
"@
Set-Content `
    -Path "$NginxHome/config/conf.d/registry.conf" `
    -Value $NginxRegistryConfig

# >>> FIRST API BUILD <<<
# If we dont do this our compose up will not have anything to run
LogHeader "Building API"
. "$PSScriptRoot/../common/lib/publish-package.ps1"
. "$PSScriptRoot/../common/lib/activate-release.ps1"
. "$PSScriptRoot/../api/lib/build-api.ps1"

# We need to revisit these maybe
# These are NOT using pulse home. They take the source from externally
# # Docker Builds an Image of API
# $BuildResult = BuildAPI -Environment $Environment

# # Docker Publishes the Image to the Registry
# $PublishedPackage = PublishPackage -Package $BuildResult -Environment $Environment # Add registry to publish to so local builds can be in a local registry

# # We tell the server to pull the new image and restart the container
# ActivateRelease -Environment $Environment -Application api -PublishedPackage $PublishedPackage

# >>> CLEAN UP <<<
LogHeader "Cleaning Up"

RunShellCommand `
    -Command "docker compose -f $ComposeFile --env-file '$ConfigPath' down" `
    -ErrorMessage "Failed to clean up temporary containers."

LogPipelineFooter -Title "Environment Setup Succesfully"

Pop-Location
