. "$PSScriptRoot/registry-config.ps1"
. "$PSScriptRoot/../../common/lib/console-logger.ps1"
. "$PSScriptRoot/../../common/lib/docker.ps1"
. "$PSScriptRoot/../../common/lib/run-shell-command.ps1"

function RegistryStart
{
    param(
        [Parameter(Mandatory)]
        [ValidateSet("development", "production", "localhost")]
        [string]$Environment
    )
    $ErrorActionPreference = "Stop"

    $Config = Get-RegistryConfig -Environment $Environment

    LogHeader -Title "Starting $Environment Registry"

    DockerRemoveContainer `
        -Server $Config.Server `
        -Container $Config.Container

    $Arguments = @(
        "-d"
        "--name $($Config.Container)"
        "--restart unless-stopped"
        "-p $($Config.Port):5000"
        "-v $($Config.Volume):$($Config.DataPath)"
        "-v $($Config.ConfigFile):/etc/distribution/config.yml:ro"
    )

    if (Test-Path Variable:\Config.Htpasswd)
    {
        $Arguments += "-v $($Config.Htpasswd):$($Config.Htpasswd):ro"
    }

    if ($Config.Secure)
    {
        $Arguments += "-v $($Config.CertsDir):/certs:ro"
    }

    $Arguments += $Config.Image

    DockerRunContainer `
        -Server $Config.Server `
        -Arguments ($Arguments -join " ") `

    LogFooter -Title "$Environment Registry Started"
}

function RegistryStop
{
    param(
        [Parameter(Mandatory)]
        [ValidateSet("development", "production", "localhost")]
        [string]$Environment
    )
    $ErrorActionPreference = "Stop"

    $Config = Get-RegistryConfig -Environment $Environment

    LogHeader -Title "Stopping $Environment Registry"

    DockerRemoveContainer `
        -Server $Config.Server `
        -Container $Config.Container

    LogFooter -Title "$Environment Registry Stopped"
}

function RegistryRestart
{
    param(
        [Parameter(Mandatory)]
        [ValidateSet("development", "production", "localhost")]
        [string]$Environment
    )
    $ErrorActionPreference = "Stop"

    $Config = Get-RegistryConfig -Environment $Environment

    DockerRestartContainer -Server $Config.Server -Container $Config.Container
}

function RegistryLog
{
    param(
        [Parameter(Mandatory)]
        [ValidateSet("development", "production", "localhost")]
        [string]$Environment
    )
    $ErrorActionPreference = "Stop"

    $Config = Get-RegistryConfig -Environment $Environment
    DockerLogContainer $Config.Server $Config.Container
}

function RegistryEnsureHtpasswd
{
    param(
        [Parameter(Mandatory)]
        [string]$Server,

        [Parameter(Mandatory)]
        [string]$Htpasswd
    )

    $command = @(
        "if [ ! -f ""$Htpasswd"" ]; then"
        "    if ! command -v htpasswd >/dev/null 2>&1; then"
        '        sudo apt-get update'
        '        sudo apt-get install -y apache2-utils'
        '    fi'
        ''
        '    echo "Registry username:"'
        '    read username'
        ''
        "    sudo htpasswd -Bc ""$Htpasswd"" `"`$username`""
        'fi'
    ) -join "`n"

    RunShellCommand `
        -Server $Server `
        -Command $command `
        -ErrorMessage "Failed to create registry htpasswd."
}

function RegistryWriteConfig
{
    param(
        [Parameter(Mandatory)]
        [string]$Server,

        [Parameter(Mandatory)]
        [hashtable]$Config
    )

    $yaml = @(
        'version: 0.1'
        'http:'
        "  addr: :5000" # From inside the container
    )

    if ($Config.Secure)
    {
        $yaml += @(
            '  tls:'
            '    certificate: /certs/domain.crt'
            '    key: /certs/domain.key'
        )
    }

    $yaml += @(
        '  auth:'
        '    htpasswd:'
        '      realm: Pulse Registry'
        "      path: $($Config.Htpasswd)"
        'storage:'
        '  filesystem:'
        "    rootdirectory: $($Config.DataPath)"
    )

    $command = @(
        "sudo tee ""$($Config.ConfigFile)"" > /dev/null <<'EOF'"
        $yaml
        'EOF'
    ) -join "`n"

    RunShellCommand `
        -Server $Server `
        -Command $command `
        -ErrorMessage "Failed to create registry config."
}

function RegistryEnsureCertificates
{
    param(
        [Parameter(Mandatory)]
        [string]$Server,

        [Parameter(Mandatory)]
        [hashtable]$Config
    )

    if (-not $Config.Secure)
    {
        return
    }

    $certDir = $Config.CertsDir

    $command = @(
        "sudo mkdir -p ""$certDir"""
        ""
        "if [ ! -f ""$certDir/domain.crt"" ]; then"
        "    sudo openssl req -newkey rsa:4096 -nodes -sha256 -x509 -days 3650 ``"
        "        -keyout ""$certDir/domain.key"" ``"
        "        -out ""$certDir/domain.crt"""
        "fi"
    ) -join "`n"

    RunShellCommand `
        -Server $Server `
        -Command $command `
        -ErrorMessage "Failed to generate registry certificates."
}