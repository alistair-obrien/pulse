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
    . "$PSScriptRoot/invoke-remote.ps1"
    . "$PSScriptRoot/docker.ps1"

    $Config = Get-EnvironmentConfig -Environment $Environment -Application $Application

    $RegistryImage = $PublishedPackage.Image

    LogHeader -Title "Activating $Application Release $RegistryImage" -Environment $Environment

    $ContainerName = "pulse-$Application-$Environment"
    $Port = $Config.Port

    # This block probably belongs on the server
    # Then ideally we can just do:
    # ssh pulse /opt/pulse/bin/activate-release.ps1 -Environment $Environment -Application $Application -Release $PublishedPackage
    InvokeRemote `
        -Server $Config.Server `
        -Command "sudo docker pull '$RegistryImage'" `
        -ErrorMessage "Failed to pull image."

    InvokeRemote `
        -Server $Config.Server `
        -Command "sudo docker rm -f $ContainerName || true" `
        -ErrorMessage "Failed to remove existing container."

    InvokeRemote `
        -Server $Config.Server `
        -Command "sudo docker run -d --name $ContainerName --restart unless-stopped -p $Port`:8080 --env-file /etc/pulse/config/$Application/$Environment.env $RegistryImage" `
        -ErrorMessage "Failed to start container."
    
    LogFooter -Title "$Application Release $RegistryImage Activated"
}