param(
    [Parameter(Mandatory)]
    [ValidateSet("Development", "Production")]
    [string]$Environment,

    [Parameter(Mandatory)]
    [ValidateSet("Api", "Web")]
    [string]$Application
)

. "$PSScriptRoot/config.ps1"

$Config = Get-EnvironmentConfig -Environment $Environment -Application $Application

$ErrorActionPreference = "Stop"

# ============================================================================
# Create Release
# ============================================================================

. "$PSScriptRoot/process-start-header.ps1" -Title "Uploading $Application" -Environment $Environment 

$Release = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd-HHmmss")
$RemoteRelease = "$($Config.ReleaseRoot)/$Release"

ssh $Config.Server "sudo install -d -o ubuntu -g ubuntu '$RemoteRelease'"

if ($LASTEXITCODE -ne 0)
{
    throw "!!! Failed to create remote release directory."
}

# ============================================================================
# Upload
# ============================================================================

$Source = "$PSScriptRoot/../$($Config.PublishRoot)"
$Destination = "$($Config.Server):$RemoteRelease"

Write-Host "$Source -> $Destination"

scp -r "$($Source)/*" $Destination

ssh $Config.Server "find '$RemoteRelease' -type d -exec chmod 755 {} \;"
ssh $Config.Server "find '$RemoteRelease' -type f -exec chmod 644 {} \;"

if ($LASTEXITCODE -ne 0)
{
    throw "!!! Upload failed."
}

. "$PSScriptRoot/process-end-header.ps1" -Title "$Application $Release Uploaded"



return $Release