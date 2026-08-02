function MigrateDatabase
{
    param
    (
        [Parameter(Mandatory)]
        [ValidateSet("development", "production")]
        [string]$Environment,
        
        [Parameter(Mandatory)]
        [string]$Release
    )
    $ErrorActionPreference = "Stop"

    . "$PSScriptRoot/../../common/lib/config.ps1"
    . "$PSScriptRoot/../../common/lib/console-logger.ps1"

    $Config = Get-EnvironmentConfig -Environment $Environment -Application api
    
    LogHeader -Title "Migrating Database" -Environment $Environment
    
    ssh $Config.Server sudo "/usr/local/bin/pulse-migrate $Environment $Release"
    
    if ($LASTEXITCODE -ne 0)
    {
        throw "Migration failed."
    }
    
    LogFooter -Title "Database Migrated"
}