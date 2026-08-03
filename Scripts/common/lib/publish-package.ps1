function PublishPackage
{
    param(
        [Parameter(Mandatory)]
        [PSCustomObject]$Package,

        [Parameter(Mandatory)]
        [ValidateSet("development", "production", "localhost")]
        [string]$Environment
    )
    $ErrorActionPreference = "Stop"

    . "$PSScriptRoot/../../common/lib/console-logger.ps1"
    . "$PSScriptRoot/../../common/lib/docker.ps1"
    . "$PSScriptRoot/../../registry/lib/registry.ps1"

    LogHeader -Title "Publishing $($Package.Image)"

    $RegistryImage = RegistryPush -Environment $Environment -Image $Package.Image

    LogFooter -Title "Published $($Package.Image)"

    return [PSCustomObject]@{
        Type  = "DockerImage"
        RegistryImage = $RegistryImage
    }
}