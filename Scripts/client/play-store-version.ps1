$PlayStoreVersionPath = "/opt/pulse/play-store-version-code.txt"

function Get-PlayStoreVersionCode
{
    $version = ssh pulse "cat $PlayStoreVersionPath"

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to read Play Store version code."
    }

    return [int]$version.Trim()
}

function Set-PlayStoreVersionCode
{
    param(
        [Parameter(Mandatory)]
        [int]$VersionCode
    )

    ssh pulse "echo $VersionCode > $PlayStoreVersionPath"

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to write Play Store version code."
    }
}