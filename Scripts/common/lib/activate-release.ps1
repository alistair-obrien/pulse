function ActivateRelease
{
    param(
        [Parameter(Mandatory)]
        [ValidateSet("development", "production")]
        [string]$Environment,

        [Parameter(Mandatory)]
        [ValidateSet("api", "client")]
        [string]$Application,

        [Parameter(Mandatory)]
        [PSCustomObject]$PublishedPackage
    )
    $ErrorActionPreference = "Stop"

    . "$PSScriptRoot/config.ps1"
    . "$PSScriptRoot/console-logger.ps1"
    . "$PSScriptRoot/run-shell-command.ps1"
    . "$PSScriptRoot/docker.ps1"

    $Config = Get-EnvironmentConfig -Environment $Environment -Application $Application

    $RegistryImage = $PublishedPackage.RegistryImage

    LogHeader -Title "Activating $RegistryImage" -Environment $Environment -Application $Application

    $ContainerName = "pulse-$Application-$Environment"
    $Port = $Config.Port

    DockerPullImage `
        -Server $Config.Server `
        -Image $RegistryImage

    DockerRemoveContainer `
        -Server $Config.Server `
        -Container $ContainerName

    DockerRunContainer `
        -Server $Config.Server `
        -Arguments "-d --name $ContainerName --restart unless-stopped -p $Port`:8080 --env-file /etc/pulse/$Application/$Environment.env $RegistryImage"
    
    LogFooter -Title "$Application Release $RegistryImage Activated"
}