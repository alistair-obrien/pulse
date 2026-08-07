function PublishGooglePlay 
{
    param
    (
        [Parameter(Mandatory)]
        [string]$PackagedPath,

        [Parameter(Mandatory)]
        [ValidateSet("development", "production")]
        [string]$Environment,

        [Parameter(Mandatory)]
        [int]$VersionCode
    )
    $ErrorActionPreference = "Stop"

    . "$PSScriptRoot/../../common/lib/console-logger.ps1"
    . "$PSScriptRoot/play-store-version.ps1"

    LogHeader -Title "Publishing Pulse Client v.$VersionCode to Google Playstore" -Environment $Environment -Platform "android"
    
    $AndroidProjectPath = Resolve-Path "$PSScriptRoot/../../../pulse.client/android"

    Push-Location $AndroidProjectPath

    Write-Host "Version Code"
    Write-Host $VersionCode

    try
    {
        # Authorization
        $path = Get-Secret PlayAccountFile -AsPlainText
        $json = Get-Content $path -Raw
        $env:ANDROID_PUBLISHER_CREDENTIALS = $json

        ./gradlew publishProductionReleaseBundle --artifact-dir $PackagedPath --track=internal
        # --info <- Add this to get detailed logs when something breaks

        if ($LASTEXITCODE -ne 0) 
        {
            throw "gradlew publish failed."
        }

        Set-PlayStoreVersionCode -VersionCode $VersionCode -Environment $Environment
    }
    finally
    {
        Pop-Location
    }

    LogFooter -Title "Pulse Client v.$VersionCode Deployed to Google Playstore"
}