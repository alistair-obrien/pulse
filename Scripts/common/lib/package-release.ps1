function PackageRelease
{
    param(
        [Parameter(Mandatory)]
        [ValidateSet("development", "production", "localhost")]
        [string]$Environment,

        [Parameter(Mandatory)]
        [ValidateSet("api", "client")]
        [string]$Application,

        [Parameter(Mandatory)]
        [string]$SourcePath # In case we support alternative packaging. We can just return the source path
    )
    $ErrorActionPreference = "Stop"

    . "$PSScriptRoot/../../common/lib/console-logger.ps1"

    if ($Environment -eq "localhost")
    {
        $Package = [PSCustomObject]@{
            Type = "Folder"
            
            Application = $Application
            Environment = $Environment
            
            SourcePath = $SourcePath
            PackagePath = $SourcePath
        }
        return $Package
    }

    LogHeader -Title "Packaging Release" -Environment $Environment -Application $Application

    $ProjectRoot = Resolve-Path "$PSScriptRoot/../../../"

    $ImageName = "pulse-$Application"
    $ImageTag = $Environment

    $Package = [PSCustomObject]@{
        Type = "DockerImage"
        
        Application = $Application
        Environment = $Environment
        
        ImageName = $ImageName
        ImageTag = $ImageTag
        ImageFullName = "$ImageName`:$ImageTag"
        SourcePath = $SourcePath
    }

    Push-Location $ProjectRoot
    try 
    {
        docker build `
            -t $Package.ImageFullName `
            -f docker/$Application/runtime.Dockerfile `
            . | Out-Host

        if ($LASTEXITCODE -ne 0)
        {
            throw "Docker image build failed."
        }
    }
    finally 
    {
        Pop-Location
    }

    LogFooter -Title "Packaged Release"

    return $Package
}