$PLAYSTORE_VERSION_CODE = "PLAYSTORE_VERSION_CODE"

function Get-PlayStoreVersionCode
{
    param
    (
        [Parameter(Mandatory)]
        [ValidateSet("development", "production")]
        [string]$Environment
    )

    . "$PSScriptRoot/../../common/lib/env-editor.ps1"

    $ConfigPath = Get-PlayStoreVersionFilePath -Environment $Environment
    # HACK force ssh pulse for now
    $version = ReadSingleVariable -ConfigPath $ConfigPath -Key $PLAYSTORE_VERSION_CODE -DefaultValue "0" -Server 'pulse'

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to read Play Store version code."
    }

    return [int]$version.Trim()
}

function Set-PlayStoreVersionCode
{
    param
    (
        [Parameter(Mandatory)]
        [ValidateSet("development", "production")]
        [string]$Environment,
            
        [Parameter(Mandatory)]
        [int]$VersionCode
    )

        . "$PSScriptRoot/../../common/lib/env-editor.ps1"


    $ConfigPath = Get-PlayStoreVersionFilePath -Environment $Environment
    # HACK force ssh pulse for now
    WriteSingleVariable -ConfigPath $ConfigPath -Key $PLAYSTORE_VERSION_CODE -Value $VersionCode -Server 'pulse'

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to write Play Store version code."
    }
}

function Get-PlayStoreVersionFilePath
{
       param
    (
        [Parameter(Mandatory)]
        [ValidateSet("development", "production")]
        [string]$Environment
    ) 

    "/etc/pulse/client/android/$Environment.env"

    return 
}