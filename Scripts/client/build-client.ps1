function BuildClient {
    param(
        [Parameter(Mandatory)]
        [ValidateSet("localhost", "development", "production")]
        [string]$Environment,

        [Parameter(Mandatory)]
        [ValidateSet("android","ios","web")]
        [string]$Platform
    )
    $ErrorActionPreference = "Stop"

    . "$PSScriptRoot/../common/config.ps1"
    . "$PSScriptRoot/../common/console-logger.ps1"

    $Config = Get-EnvironmentConfig -Environment $Environment -Application client

    LogHeader -Title "Building Pulse Client" -Environment $Environment

    $ProjectRoot = Resolve-Path "$PSScriptRoot/../../Frontend - Vanilla Web"

    Push-Location $ProjectRoot

    $BuildPath = "$PSScriptRoot/../../$($Config.PublishRoot)/$Environment/$Platform"

    $parent = Split-Path $BuildPath -Parent
    New-Item -ItemType Directory -Force -Path $parent | Out-Null

    try {
        if (Test-Path $BuildPath) {
            Remove-Item $BuildPath -Recurse -Force
        }

        npm ci | Out-Host
        if ($LASTEXITCODE -ne 0) {
            throw "npm ci failed."
        }

        $env:VITE_OUT_DIR = $BuildPath
        npx vite build --mode $Environment | Out-Host
        Remove-Item Env:VITE_OUT_DIR

        if ($LASTEXITCODE -ne 0) {
            throw "Web build failed."
        }
    }
    finally {
        Pop-Location
    }

    LogFooter -Title "Pulse Client Built $BuildPath"

    $BuiltPath = "$BuildPath"

    return $BuiltPath
}