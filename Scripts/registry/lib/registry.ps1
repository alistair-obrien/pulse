. "$PSScriptRoot/../../common/lib/console-logger.ps1"
. "$PSScriptRoot/../../common/lib/run-shell-command.ps1"

function RegistryInitialize
{
    param(
        [Parameter(Mandatory)]
        [string]$PulseHome,
        [Parameter(Mandatory)]
        [string]$RegistryHost,

        [string]$Server #SSH host really
    )

    $ErrorActionPreference = "Stop"

    LogHeader "Initializing Registry"

    $Config = @{
        ConfigDir  = "$PulseHome/config/registry"
        ConfigFile = "$PulseHome/config/registry/config.yml"
        AuthDir    = "$PulseHome/config/registry/auth"
        CertsDir   = "$PulseHome/config/registry/certs"
        Htpasswd   = "$PulseHome/config/registry/auth/htpasswd"
    }

    RunShellCommand `
        -Server $Server `
        -Command @"
New-Item -ItemType Directory -Force -Path '$($Config.AuthDir)' | Out-Null
New-Item -ItemType Directory -Force -Path '$($Config.CertsDir)' | Out-Null
"@ `
        -ErrorMessage "Failed to create registry directories."

    RegistryEnsureHtpasswd `
        -Server $Server `
        -Htpasswd $Config.Htpasswd

    RegistryWriteConfig `
        -Server $Server `
        -ConfigFile $Config.ConfigFile `
        -HtpasswdPath $Config.Htpasswd

    # RegistryEnsureCertificates `
    #     -Server $Server `
    #     -CertsDir $Config.CertsDir

    LogFooter "Registry Initialized"
}

function RegistryEnsureHtpasswd
{
    param(
        [string]$Server,

        [Parameter(Mandatory)]
        [string]$Htpasswd
    )

    if (Test-Path $Htpasswd)
    {
        return
    }

    if (-not (Get-Command htpasswd -ErrorAction SilentlyContinue))
    {
        throw "htpasswd is not installed. Please install Apache2 utilities."
    }

    Write-Host "Registry username: " -NoNewline
    $Username = Read-Host

    RunShellCommand `
        -Server $Server `
        -Command "htpasswd -Bc '$Htpasswd' '$Username'" `
        -ErrorMessage "Failed to create registry htpasswd."
}

function RegistryWriteConfig
{
    param(
        [string]$Server,

        [Parameter(Mandatory)]
        [string]$ConfigFile,

        [Parameter(Mandatory)]
        [string]$HtpasswdPath,

        [switch]$Secure
    )

    $Yaml = @(
        "version: 0.1"
        "http:"
        "  addr: :5000"
    )

    if ($Secure)
    {
        $Yaml += @(
            "  tls:"
            "    certificate: /certs/domain.crt"
            "    key: /certs/domain.key"
        )
    }

    $Yaml += @(
        "  auth:"
        "    htpasswd:"
        "      realm: Pulse Registry"
        "      path: $HtpasswdPath"
        "storage:"
        "  filesystem:"
        "    rootdirectory: /var/lib/registry"
    )

    $Content = ($Yaml -join "`n").Replace("'", "''")

    RunShellCommand `
        -Server $Server `
        -Command {
            param($Path, $Content)

            Set-Content -Path $Path -Value $Content
        } `
        -ArgumentList $ConfigFile, ($Yaml -join "`n") `
        -ErrorMessage "Failed to write registry config."
}

function RegistryEnsureCertificates
{
    param(
        [string]$Server,

        [Parameter(Mandatory)]
        [string]$CertsDir
    )

    RunShellCommand `
        -Server $Server `
        -Command @"
if (-not (Test-Path '$CertsDir/domain.crt'))
{
    openssl req `
        -newkey rsa:4096 `
        -nodes `
        -sha256 `
        -x509 `
        -days 3650 `
        -keyout '$CertsDir/domain.key' `
        -out '$CertsDir/domain.crt'
}
"@ `
    -ErrorMessage "Failed to generate registry certificates."
}

function Get-RegistryConfig
{
    param(
        [Parameter(Mandatory)]
        [ValidateSet("development", "production", "localhost")]
        [string]$Environment
    )

    . "$PSScriptRoot/../../common/lib/env-editor.ps1"

    # First get the environments config
    $EnvConfig = ReadEnvFile -File "$RepoRoot/docker/$Environment.env"

    
    $RegistryHost = "$($EnvConfig.REGISTRY_HOST):$($EnvConfig.REGISTRY_PORT)"

    return @{
        Environment = $Environment
        RegistryHost  = $RegistryHost
    }
}


function RegistryPush
{
    param(
        [Parameter(Mandatory)]
        [string]$Environment,

        [string]$Image,

        [string]$Server
    )

    $RegistryConfig = Get-RegistryConfig -Environment $Environment

    # # TODO: Move the login to the Registry space
    # if (!(DockerRegistryLogin -Registry $($RegistryConfig.RegistryHost)))
    # {
    #     throw "Docker registry authentication failed."
    # }

    $RegistryImage = "$($RegistryConfig.RegistryHost)/$($Image)"

    RunShellCommand `
        -Server $Server `
        -Command "docker tag $Image $RegistryImage" `
        -ErrorMessage "Failed to write tag image." `
        | Out-Host
        
    
    RunShellCommand `
        -Server $Server `
        -Command "docker push $RegistryImage" `
        -ErrorMessage "Failed to push image." `
        | Out-Host

    return $RegistryImage
}

function RegistryPull
{
    param(
        [Parameter(Mandatory)]
        [string]$Environment,

        [Parameter]
        [string]$Image
    )

    $Config = Get-RegistryConfig -Enviroment $Environment

    
}