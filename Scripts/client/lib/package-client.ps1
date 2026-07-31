function PackageClient 
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
        [string]$BuiltPath
    )
    $ErrorActionPreference = "Stop"

    . "$PSScriptRoot/../../common/lib/console-logger.ps1"
    . "$PSScriptRoot/play-store-version.ps1"

    # Web does not need packaging
    if ($Platform -eq "web")  
    {
        return [PSCustomObject]@{
            OutputFile = $BuiltPath
        }   
    }

    LogHeader -Title "Packaging Pulse Client" -Environment $Environment -Platform $Platform

    $ProjectRoot = Resolve-Path "$PSScriptRoot/../../../Frontend - Vanilla Web"

    $env:PULSE_APP_NAME = "Pulse"
    try 
    {
        if ($Platform -eq "android")
        {
            Push-Location "$ProjectRoot"

            try
            {
                Write-Host "Syncing Capacitor..."

                $env:PULSE_WEB_DIR = $BuiltPath
                npx cap sync android | Out-Host
                if ($LASTEXITCODE -ne 0) { throw "Capacitor sync failed." }

                Push-Location "android"

                try
                {
                    Write-Host "Building Android App Bundle..."

                    # TODO: Move these from local secrets to server .env
                    # That way new dev environments are easier to setup and controlled by the ssh user's permissions 
                    $env:ANDROID_STORE_FILE     = Get-Secret AndroidStoreFile -AsPlainText
                    $env:ANDROID_STORE_PASSWORD = Get-Secret AndroidStorePassword -AsPlainText
                    $env:ANDROID_KEY_ALIAS      = Get-Secret AndroidKeyAlias -AsPlainText
                    $env:ANDROID_KEY_PASSWORD   = Get-Secret AndroidKeyPassword -AsPlainText

                    $CurrentVersionCode = Get-PlayStoreVersionCode -Environment $Environment
                    $NextVersionCode = $CurrentVersionCode + 1

                    ./gradlew bundleProductionRelease "-PversionCode=$NextVersionCode" | Out-Host
                    if ($LASTEXITCODE -ne 0) { throw "Gradle build failed." }

                    $Artifact = Resolve-Path "app/build/outputs/bundle/productionRelease/app-production-release.aab"
                    
                    $OutputFile = Join-Path "$BuiltPath" "Pulse.aab"
                    
                    Copy-Item $Artifact $OutputFile -Force
                }
                finally
                {
                    # Pop-Location
                    Pop-Location
                }
            }
            finally
            {
                Pop-Location
            }
        }
    } 
    finally 
    {
        Remove-Item Env:PULSE_APP_ID -ErrorAction Ignore
    }

    LogFooter -Title "Pulse Client v.$NextVersionCode Packaged $OutputFile" 
    return [PSCustomObject]@{
        OutputFile  = $OutputFile
        VersionCode = $NextVersionCode
    }
}