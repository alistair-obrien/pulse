function PublishPackage
{
    param(
        [Parameter(Mandatory)]
        [PSCustomObject]$Package
    )
    $ErrorActionPreference = "Stop"

    . "$PSScriptRoot/../../common/lib/console-logger.ps1"
    . "$PSScriptRoot/../../common/lib/docker.ps1"
    . "$PSScriptRoot/../../common/lib/upload-release.ps1"

    $Registry = "registry.pulse-flow.app"
    $RegistryImage = "$Registry/$($Package.Image)"

    LogHeader -Title "Publishing Package to $Registry"

    if (!(DockerRegistryLogin -Registry $Registry))
    {
        throw "Docker registry authentication failed."
    }

    docker tag `
        $Package.Package.Image `
        $RegistryImage | Out-Host

    if ($LASTEXITCODE -ne 0)
    {
        throw "Docker tag failed."
    }

    docker push `
        $RegistryImage | Out-Host

    if ($LASTEXITCODE -ne 0)
    {
        throw "Docker push failed."
    }

    $PublishedPackage = [PSCustomObject]@{
        Type = "DockerImage"

        Application = $Package.Application
        Environment = $Package.Environment

        Registry = $Registry

        ImageName = $Package.ImageName
        ImageTag = $Package.ImageTag

        ImageFullName = $RegistryImage
    }

    LogFooter -Title "Published $($Package.Image) to $Registry"

    return $PublishedPackage
}