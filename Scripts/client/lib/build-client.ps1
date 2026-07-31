function BuildClient {
    param(
        [Parameter(Mandatory)]
        [ValidateSet("localhost", "development", "production")]
        [string]$Environment,

        [Parameter(Mandatory)]
        [ValidateSet("android","ios","web")]
        [string]$Platform,

        [switch]$CleanInstall
    )
    $ErrorActionPreference = "Stop"

    . "$PSScriptRoot/../../common/lib/config.ps1"
    . "$PSScriptRoot/../../common/lib/console-logger.ps1"

    $Config = Get-EnvironmentConfig -Environment $Environment -Application client

    LogHeader -Title "Building Pulse Client" -Environment $Environment

    $ProjectRoot = Resolve-Path "$PSScriptRoot/../../../Frontend - Vanilla Web"

    Push-Location $ProjectRoot

    $BuildPath = "$PSScriptRoot/../../../$($Config.PublishRoot)/$Environment/$Platform"

    $parent = Split-Path $BuildPath -Parent
    New-Item -ItemType Directory -Force -Path $parent | Out-Null

    try {
        if (Test-Path $BuildPath) {
            Remove-Item $BuildPath -Recurse -Force
        }

        if ($CleanInstall) 
        {
            & npm ci | Out-Host
            if ($LASTEXITCODE -ne 0) {
                throw "npm ci failed."
            }
        }

        try
        {
            $env:VITE_OUT_DIR = $BuildPath

            & npx vite build --mode $Environment | Out-Host

            if ($LASTEXITCODE -ne 0)
            {
                throw "Vite build failed."
            }
        }
        finally
        {
            Remove-Item Env:VITE_OUT_DIR -ErrorAction Ignore
        }
    }
    finally {
        Pop-Location
    }

    LogFooter -Title "Pulse Client Built $BuildPath"

    return $BuildPath
}