function InvokeRemote
{
    param(
        [string]$Server,
        [string]$Command,
        [string]$ErrorMessage
    )

    ssh $Server $Command

    if ($LASTEXITCODE -ne 0)
    {
        throw $ErrorMessage
    }
}