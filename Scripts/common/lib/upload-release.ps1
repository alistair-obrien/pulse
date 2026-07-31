function UploadRelease
{
    param
    (
        [Parameter(Mandatory)]
        [ValidateSet("development", "production")]
        [string]$Environment,

        [Parameter(Mandatory)]
        [ValidateSet("api", "client")]
        [string]$Application,

        [Parameter(Mandatory)]
        [string]$SourcePath
    )
    $ErrorActionPreference = "Stop"

    . "$PSScriptRoot/console-logger.ps1"
    . "$PSScriptRoot/config.ps1"

    $Config = Get-EnvironmentConfig -Environment $Environment -Application $Application

    # ============================================================================
    # Create Release
    # ============================================================================

    LogHeader -Title "Uploading $Application" -Environment $Environment 

    $Release = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd-HHmmss")
    $RemoteRelease = "$($Config.ReleaseRoot)/$Release"

    ssh $Config.Server "sudo install -d -o ubuntu -g ubuntu '$RemoteRelease'"

    if ($LASTEXITCODE -ne 0)
    {
        throw "Failed to create remote release directory."
    }

    # ============================================================================
    # Upload
    # ============================================================================
    
    $DestinationPath = "$($Config.Server):$RemoteRelease"

    $SourcePath = "$($SourcePath)"

    Write-Host "$SourcePath -> $DestinationPath"

    scp -r "$($SourcePath)/*" $DestinationPath

    if ($LASTEXITCODE -ne 0)
    {
        throw "scp failed."
    }

    ssh $Config.Server "find '$RemoteRelease' -type d -exec chmod 755 {} \;"

    if ($LASTEXITCODE -ne 0)
    {
        throw "Failed to set directory permissions."
    }

    ssh $Config.Server "find '$RemoteRelease' -type f -exec chmod 644 {} \;"

    if ($LASTEXITCODE -ne 0)
    {
        throw "Failed to set file permissions."
    }

    LogFooter -Title "$Application $Release Uploaded"

    return $Release
}








