function DeployClient 
{
    param
    (
        [Parameter(Mandatory)]
        [ValidateSet("localhost", "development", "production")]
        [string]$Environment,

        [Parameter(Mandatory)]
        [ValidateSet("android","ios","web")]
        [string]$Platform,

        [Parameter(Mandatory)]
        [PSCustomObject]$PackagedResult
    )
    $ErrorActionPreference = "Stop"

    . "$PSScriptRoot/../common/console-logger.ps1"
    . "$PSScriptRoot/../common/upload-release.ps1"
    . "$PSScriptRoot/../common/activate-release.ps1"
    . "$PSScriptRoot/publish-google-play.ps1"

    LogHeader -Title "Deploying Pulse Client" -Environment $Environment -Platform $Platform

    # Web Deploys to the server
    if ($Platform -eq "web") 
    {
        $Release = UploadRelease -Environment $Environment -Application client -SourcePath $PackagedResult.OutputFile
        ActivateRelease -Environment $Environment -Application client -Release $Release
    }
    # Apps Deploy to their app store
    elseif ($Platform -eq "android") 
    {
        # Deploy to app store
        PublishGooglePlay -PackagedPath $PackagedResult.OutputFile -VersionCode $PackagedResult.VersionCode -Environment $Environment
    }
    elseif ($Platform -eq "ios")
    {
        # Deploy to apple store
    }

    LogFooter -Title "Pulse Client Deployed"
}