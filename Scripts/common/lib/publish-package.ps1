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
    . "$PSScriptRoot/../../common/lib/docker.ps1"
    . "$PSScriptRoot/../../common/lib/upload-release.ps1"


    if ($Package.Type -eq "Folder")
    {
        $PublishedPackage = [PSCustomObject]@{
            Type = "Folder"

            Application = $Package.Application
            Environment = $Package.Environment

            SourcePath = $SourcePath
            PackagePath = $SourcePath
        }

        UploadRelease -Environment $Environment -Application $Application -SourcePath $Package.SourcePath
        if ($LASTEXITCODE -ne 0)
        {
            throw "Upload failed."
        }

        return $PublishedPackage
    }

    if ($Package.Type -eq "DockerImage")
    {
        $Registry = "registry.pulse-flow.app"
        $RegistryImage = "$Registry/$($Package.ImageFullName)"

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
            throw "Docker tag failed."
        }

        docker push `
            $RegistryImage | Out-Host

        if ($LASTEXITCODE -ne 0)
        {
            throw "Docker push failed."
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