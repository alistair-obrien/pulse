function LogHeader {
    param(
        [Parameter(Mandatory)]
        [string]$Title,

        [string]$Environment,
        
        [string]$Platform,

        [string]$Application
    )

    Write-Host ""

    Write-Host "  > " -NoNewline -ForegroundColor DarkBlue
    if ($Environment)
    {
        $environmentColor = switch ($Environment)
        {
            "development" { "Cyan" }
            "production"  { "Magenta" }
            "localhost"       { "White" }
            "default"     { "Grey" }
        }

        Write-Host "[" -NoNewline -ForegroundColor DarkBlue
        Write-Host $Environment -NoNewline -ForegroundColor $environmentColor
        Write-Host "] " -NoNewline -ForegroundColor DarkBlue
    }
    
    if ($Platform)
    {
        $platformColor = switch ($Platform)
        {
            "web"     { "White" }
            "android" { "Cyan" }
            "ios"     { "Magenta" }
            "default" { "Grey" }
        }

        Write-Host "[" -NoNewline -ForegroundColor DarkBlue
        Write-Host $Platform -NoNewline -ForegroundColor $platformColor
        Write-Host "] " -NoNewline -ForegroundColor DarkBlue
    }

    if ($Application)
    {
        $applicationColor = switch ($Application)
        {
            "api"     { "White" }
            "client"  { "Cyan" }
        }

        Write-Host "[" -NoNewline -ForegroundColor Blue
        Write-Host $Application -NoNewline -ForegroundColor $applicationColor
        Write-Host "] " -NoNewline -ForegroundColor Blue
    }

    Write-Host $Title -NoNewline -ForegroundColor DarkBlue

    Write-Host "" -ForegroundColor DarkBlue
    Write-Host ("-" * ($Host.UI.RawUI.WindowSize.Width - 1)) -ForegroundColor DarkBlue
}

function LogFooter {
    param(
    [Parameter(Mandatory)]
    [string]$Title
    )

    Write-Host "$([char]0x2713) $Title" -ForegroundColor DarkGreen
    Write-Host ("-" * ($Host.UI.RawUI.WindowSize.Width - 1)) -ForegroundColor DarkBlue
    Write-Host ""
}

function LogPipelineHeader {
    param(
        [Parameter(Mandatory)]
        [string]$Title,

        [string]$Environment,
        
        [string]$Platform,

        [string]$Application
    )

    Write-Host ""

    Write-Host ">>> " -NoNewline -ForegroundColor Blue
    if ($Environment)
    {
        $environmentColor = switch ($Environment)
        {
            "development" { "Cyan" }
            "production"  { "Magenta" }
            "localhost"   { "White" }
            "default"     { "Grey" }
        }

        Write-Host "[" -NoNewline -ForegroundColor Blue
        Write-Host $Environment -NoNewline -ForegroundColor $environmentColor
        Write-Host "] " -NoNewline -ForegroundColor Blue
    }
    
    if ($Platform)
    {
        $platformColor = switch ($Platform)
        {
            "web"     { "White" }
            "android" { "Cyan" }
            "ios"     { "Magenta" }
            "default" { "Grey" }
        }

        Write-Host "[" -NoNewline -ForegroundColor Blue
        Write-Host $Platform -NoNewline -ForegroundColor $platformColor
        Write-Host "] " -NoNewline -ForegroundColor Blue
    }

    if ($Application)
    {
        $applicationColor = switch ($Application)
        {
            "api"     { "White" }
            "client"  { "Cyan" }
        }

        Write-Host "[" -NoNewline -ForegroundColor Blue
        Write-Host $Application -NoNewline -ForegroundColor $applicationColor
        Write-Host "] " -NoNewline -ForegroundColor Blue
    }

    Write-Host $Title -NoNewline -ForegroundColor Blue

    Write-Host " <<<" -ForegroundColor Blue
    Write-Host ("=" * ($Host.UI.RawUI.WindowSize.Width - 1)) -ForegroundColor Blue
}

function LogPipelineFooter {
    param(
    [Parameter(Mandatory)]
    [string]$Title
    )

    Write-Host "$([char]0x2713)$([char]0x2713)$([char]0x2713) $Title" -ForegroundColor Green
    Write-Host ("-" * ($Host.UI.RawUI.WindowSize.Width - 1)) -ForegroundColor Blue
    Write-Host ""
}