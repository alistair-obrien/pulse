function RestartServer
{
    param
    (
        [Parameter(Mandatory)]
        [ValidateSet("development", "production", "localhost")]
        [string]$Environment
    )
    $ErrorActionPreference = "Stop"
        
    . "$PSScriptRoot/../../common/lib/config.ps1"
    . "$PSScriptRoot/../../common/lib/console-logger.ps1"
    
    $Config = Get-EnvironmentConfig -Environment $Environment -Application Api
    
    LogHeader -Title "Restarting Server" -Environment $Environment 
    
    ssh $Config.Server "sudo systemctl restart $($Config.Service)"
    
    if ($LASTEXITCODE -ne 0)
    {
        throw "Restart failed."
    }
    
    LogFooter -Title "Server Restarted"
}