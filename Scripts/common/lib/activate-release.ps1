function ActivateRelease
{
    param(
        [Parameter(Mandatory)]
        [string]$Environment,

        [Parameter(Mandatory)]
        [ValidateSet("api", "client")]
        [string]$Application,

        [Parameter(Mandatory)]
        [PSCustomObject]$PublishedPackage
    )
    $ErrorActionPreference = "Stop"

    . "$PSScriptRoot/config.ps1"
    . "$PSScriptRoot/console-logger.ps1"
    . "$PSScriptRoot/run-shell-command.ps1"
    . "$PSScriptRoot/docker.ps1"

    LogHeader -Title "Activating $RegistryImage" -Environment $Environment -Application $Application
    
    $ConfigPath = (Resolve-Path (Join-Path $PSScriptRoot "../../../docker/$Environment.env")).Path
    $ComposeFile = (Resolve-Path (Join-Path $PSScriptRoot "../../../docker/compose-api.yml")).Path

    $RegistryImage = $PublishedPackage.RegistryImage
    Write-Host $RegistryImage

    RunShellCommand `
        -Command {
            param($ComposeFile, $Project, $ConfigPath)

            docker compose `
                -f $ComposeFile `
                -p $Project `
                --env-file $ConfigPath `
                pull api

            docker compose `
                -f $ComposeFile `
                -p $Project `
                --env-file $ConfigPath `
                up -d api
        } `
        -ArgumentList "$ComposeFile", "pulse-$Environment", $ConfigPath `
        -ErrorMessage "Failed to activate API release."
    
    LogFooter -Title "$Application Release $RegistryImage Activated"
}