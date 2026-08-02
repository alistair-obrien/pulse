function RegistryInitialize
{
    param(
        [Parameter(Mandatory)]
        [ValidateSet("development", "production", "localhost")]
        [string]$Environment
    )

    $ErrorActionPreference = "Stop"

    . "$PSScriptRoot/../../common/lib/console-logger.ps1"
    . "$PSScriptRoot/../../common/lib/run-shell-command.ps1"
    . "$PSScriptRoot/../../common/lib/docker.ps1"
    . "$PSScriptRoot/registry-config.ps1"
    . "$PSScriptRoot/registry.ps1"

    $Config = Get-RegistryConfig -Environment $Environment

    LogHeader -Title "Initializing $Environment Registry"

    # Create persistent registry volume
    DockerEnsureVolume `
        -Server $Config.Server `
        -Volume $Config.Volume

    # Create configuration directories
    $command = @(
        "sudo mkdir -p ""$($Config.ConfigDir)"""
        "sudo mkdir -p ""$($Config.AuthDir)"""
        "sudo mkdir -p ""$($Config.CertsDir)"""

        "ls -ld ""$($Config.ConfigDir)"""
        "ls -ld ""$($Config.AuthDir)"""
        "ls -ld ""$($Config.CertsDir)"""
    ) -join "`n"

    RunShellCommand `
        -Server $Config.Server `
        -Command $command `
        -ErrorMessage "Failed to create registry directories."

    RegistryEnsureHtpasswd `
        -Server $Config.Server `
        -Htpasswd $Config.Htpasswd

    # Overwrites old config
    RegistryWriteConfig `
        -Server $Config.Server `
        -Config $Config

    RegistryEnsureCertificates `
        -Server $Config.Server `
        -Config $Config
    
    LogFooter -Title "$Environment Registry Initialized"
}