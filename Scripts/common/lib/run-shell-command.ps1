function RunShellCommand
{
    [CmdletBinding()]
    param(
        [string]$Server,
        [string]$Command,
        [object[]]$ArgumentList,
        [string]$ErrorMessage
    )

    if ($Server)
    {
        $Output = ssh $Server pwsh -NoProfile -Command $Command @ArgumentList
    }
    else
    {
        $Output = & ([scriptblock]::Create($Command)) @ArgumentList
    }

    if ($LASTEXITCODE)
    {
        throw $ErrorMessage
    }

    return $Output
}