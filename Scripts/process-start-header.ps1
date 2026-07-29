param(
    [Parameter(Mandatory)]
    [string]$Title,

    [string]$Environment
)

Write-Host ""

Write-Host ">>> " -NoNewline -ForegroundColor Blue
if ($Environment)
{
    $environmentColor = switch ($Environment)
    {
        "Development" { "Cyan" }
        "Production"  { "Magenta" }
        "Local"       { "White" }
        "Default"     { "Grey" }
    }

    Write-Host "[" -NoNewline -ForegroundColor Blue
    Write-Host $Environment -NoNewline -ForegroundColor $environmentColor
    Write-Host "] " -NoNewline -ForegroundColor Blue
}
Write-Host $Title -NoNewline -ForegroundColor Blue

Write-Host " <<<" -ForegroundColor Blue
Write-Host ("=" * ($Host.UI.RawUI.WindowSize.Width - 1)) -ForegroundColor Blue