param(
    [Parameter(Mandatory)]
    [string]$Title
)

Write-Host "$([char]0x2713) $Title" -ForegroundColor Green
Write-Host ("-" * ($Host.UI.RawUI.WindowSize.Width - 1)) -ForegroundColor Blue
Write-Host ""