function ActivateRelease
{
    param(
        [Parameter(Mandatory)]
        [ValidateSet("development", "production")]
        [string]$Environment,

        [Parameter(Mandatory)]
        [ValidateSet("api", "client")]
        [string]$Application,

        [Parameter(Mandatory)]
        [string]$Release
    )
    $ErrorActionPreference = "Stop"

    . "$PSScriptRoot/config.ps1"
    . "$PSScriptRoot/../common/console-logger.ps1"

    $Config = Get-EnvironmentConfig -Environment $Environment -Application $Application

    $Current = $Config.CurrentRoot
    $Target = "$($Config.ReleaseRoot)/$Release"

    LogHeader -Title "Activating $API Release $Target $Release" -Environment $Environment

    ssh $Config.Server "ln -sfn '$Target' '$Current'"

    if ($LASTEXITCODE -ne 0)
    {
        throw "Failed to activate release."
    }

    LogFooter -Title "$API Release $Target $Release Activated"
}