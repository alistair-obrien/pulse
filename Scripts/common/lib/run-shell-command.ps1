function RunShellCommand
{
    param(
        [string]$Server,
        [string]$Command,
        [string]$ErrorMessage
    )

    if ($Server)
    {
        ssh -tt $Server $Command
    }
    else 
    {
        & powershell -Command $Command | Out-Host
    }

    if ($LASTEXITCODE)
    {       
        Write-Host $Server
        Write-Host $Command
        Write-Host "Exit code: $LASTEXITCODE"
        throw $ErrorMessage
    }
}