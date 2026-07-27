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

Write-Host ">>> Creating Release <<<"

$Release = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd-HHmmss")
$RemoteRelease = "$($Config.ReleaseRoot)/$Release"

Write-Host ""
Write-Host "Environment: $Environment"
Write-Host "Creating release..."
Write-Host $RemoteRelease

Write-Host "ssh $($Config.Server)"

ssh $Config.Server "sudo mkdir -p '$($Config.ReleaseRoot)'"
ssh $Config.Server "sudo chown -R ubuntu:ubuntu '$($Config.ReleaseRoot)'"

if ($LASTEXITCODE -ne 0)
{
    throw "!!! Failed to create remote release directory."
}

# ============================================================================
# Upload
# ============================================================================

Write-Host ">>> Uploading <<<"

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

Write-Host ">>> Release uploaded successfully. <<<"
Write-Host "Release: $Release"

return $Release