function PublishPackage
{
    param(
        [Parameter(Mandatory)]
        [ValidateSet("development", "production", "localhost")]
        [string]$Environment,

        [Parameter(Mandatory)]
        [ValidateSet("api", "client")]
        [string]$Application,

        [Parameter(Mandatory)]
        [PSCustomObject]$Package
    )
    $ErrorActionPreference = "Stop"

    . "$PSScriptRoot/../../common/lib/console-logger.ps1"

    if ($Package.Type -eq "Folder")
    {
        return $Package
    }

    
    if ($Package.Type -eq "DockerImage")
    {
        $Registry = "registry.pulse-flow.app"
        $RegistryImage = "$Registry/$Package.ImageFullName"

        LogHeader -Title "Publishing Package to $Registry" -Environment $Environment -Application $Application

        if (!(DockerRegistryLogin -Registry $Registry))
        {
            throw "Docker registry authentication failed."
        }

        docker tag `
            $Package.ImageFullName `
            $RegistryImage | Out-Host

        if ($LASTEXITCODE -ne 0)
        {
            throw "Publish failed."
        }

        docker push `
            $RegistryImage | Out-Host

        if ($LASTEXITCODE -ne 0)
        {
            throw "Publish failed."
        }
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

    LogFooter -Title "Published Package to $Registry"

    return $PublishedPackage
}