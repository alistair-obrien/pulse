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
    . "$PSScriptRoot/../../common/lib/upload-release.ps1"

    . "$PSScriptRoot/../../registry/lib/registry-config.ps1"
    $RegistryConfig = Get-RegistryConfig -Environment $Environment

    $RegistryImage = "$($RegistryConfig.ServerUrl)/$($Package.Image)"

    LogHeader -Title "Publishing $($Package.Image) to $($RegistryConfig.ServerUrl)"

    # TODO: Move the login to the Registry space
    if (!(DockerRegistryLogin -Registry $($RegistryConfig.ServerUrl)))
    {
        throw "Docker registry authentication failed."
    }

    docker tag $Package.Image $RegistryImage | Out-Host

    if ($LASTEXITCODE -ne 0)
    {
        throw "Docker tag failed."
    }

    docker push $RegistryImage | Out-Host

    if ($LASTEXITCODE -ne 0)
    {
        throw "Docker push failed."
    }

    LogFooter -Title "Published $($Package.Image) to $($RegistryConfig.ServerUrl)"

    return [PSCustomObject]@{
        Type  = "DockerImage"
        RegistryImage = $RegistryImage
    }
}