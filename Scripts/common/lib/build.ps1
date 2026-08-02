function PrepareBuildPath
{
    param(
        [Parameter(Mandatory)]
        [ValidateSet("development", "production", "localhost")]
        [string]$Environment,
        
        [Parameter(Mandatory)]
        [ValidateSet("api", "client")]
        [string]$Application,

        [ValidateSet("ios", "android", "web")]
        [string]$Platform
    )
    $ErrorActionPreference = "Stop"

    . "$PSScriptRoot/../../common/lib/console-logger.ps1"

    LogHeader -Title "Preparing Build Path" -Environment $Environment

    $ProjectRoot = Resolve-Path "$PSScriptRoot/../../../"
    $BuildPath = "$ProjectRoot/publish/$Application/$Environment"
    if ($Platform) {
        $BuildPath = "$BuildPath/$Platform"
    }

    if (Test-Path $BuildPath)
    {
        Remove-Item $BuildPath -Recurse -Force
        New-Item -ItemType Directory -Path $BuildPath -Force | Out-Null
    }    
    if ($LASTEXITCODE -ne 0)
    {
        throw "Vite build failed."
    }

    LogFooter -Title "Build Path Prepared at $BuildPath"

    return $BuildPath
}