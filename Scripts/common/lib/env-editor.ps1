function SetConfigValue
{
    param(
        [Parameter(Mandatory)]
        [hashtable]$Config,

        [Parameter(Mandatory)]
        [string]$Key,

        [Parameter(Mandatory)]
        [AllowEmptyString()]
        [string]$Value
    )

    switch ($Value)
    {
        ""  { }
        "#" { $Config.Remove($Key) }
        default { $Config[$Key] = $Value }
    }
}

function PromptEnvValue
{
    param(
        [Parameter(Mandatory)]
        [hashtable]$Config,
        
        [Parameter(Mandatory)]
        [string]$Key,

        [string]$Prompt,
        
        [switch]$Secret
    )

    $current = $Config[$Key]

    $display = if ($Secret)
    {
        if ($current) { "*" * 12 } else { "" }
    }
    else
    {
        $current
    }

    Write-Host "Set $Prompt " -NoNewline
    Write-Host "[$display]" -ForegroundColor DarkCyan -NoNewline
    Write-Host ": " -NoNewline

    $Input = Read-Host

    SetConfigValue -Config $Config -Key $Key -Value $Input
}

function DisplayEnvValue
{
    param(
        [Parameter(Mandatory)]
        [hashtable]$Config,
        [Parameter(Mandatory)]
        [string]$Key,
        [string]$Prompt,
        [switch]$Secret
    )

    $current = $Config[$Key]

    $display = if ($Secret)
    {
        if ($current) { "*" * 12 } else { "" }
    }
    else
    {
        $current
    }

    Write-Host "$Prompt [$display]" -ForegroundColor DarkCyan
}

function ReadEnvFile
{
    param(
        [Parameter(Mandatory)]
        [string]$File,
        [string]$Server
    )

    $config = [hashtable]@{}

    . "$PSScriptRoot/run-shell-command.ps1"

    $lines = RunShellCommand `
        -Command "Get-Content -Path $File" `
        -Server $Server `
        -ErrorMessage "Failed to read file."

    if (-not $lines)
    {
        Write-Host "$File does not exist. Will write a new file after config is set."
        return $config
    }

    Write-Host ">>> $File"
    # Found a file
    foreach ($line in $lines)
    {
        Write-Host ">>> $line"
        $line = $line.Trim()

        if ($line -eq "") { continue }
        if ($line.StartsWith("#")) { continue }

        $parts = $line -split "=", 2

        if ($parts.Count -eq 2)
        {
            $config[$parts[0]] = $parts[1]
        }
    }

    return $config
}

function ReadSingleVariable
{
    param(
        [Parameter(Mandatory)]
        [string]$ConfigPath,

        [Parameter(Mandatory)]
        [string]$Key,

        [string]$DefaultValue = ""
    )

    $Config = ReadEnvFile $ConfigPath

    if ($Config.ContainsKey($Key))
    {
        return $Config[$Key]
    }

    return $DefaultValue
}

# Writes all variables in the config
function WriteEnvFile
{
    param(
        [Parameter(Mandatory)]
        [string]$File,

        [Parameter(Mandatory)]
        [hashtable]$Config,

        [string]$Server
    )
    . "$PSScriptRoot/run-shell-command.ps1"

    $lines = foreach ($key in ($Config.Keys | Sort-Object))
    {
        if (-not [string]::IsNullOrWhiteSpace($Config[$key]))
        {
            "$key=$($Config[$key])"
        }
    }

    $joinedLines = ($lines -join "`n").Replace("'", "''")

    RunShellCommand `
        -Command "Set-Content -Path $File -Value '$JoinedLines'" `
        -ErrorMessage "Failed to write file." `
        -Server $Server
}

# Writes only the configured variables
function WriteConfiguredEnvFile
{
    param(
        [Parameter(Mandatory)]
        [string]$File,

        [Parameter(Mandatory)]
        [hashtable]$Config,

        [Parameter(Mandatory)]
        [hashtable[]]$Settings,

        [string]$Server
    )

    $filtered = @{}

    foreach ($setting in $Settings)
    {
        $key = $setting.Key

        if ($Config.ContainsKey($key))
        {
            $filtered[$key] = $Config[$key]
        }
    }

    WriteEnvFile `
        -File $File `
        -Config $filtered `
        -Server $Server
}

# Writes a single variable while preserving existing variables
function WriteSingleVariable
{
    param(
        [Parameter(Mandatory)]
        [string]$ConfigPath,

        [Parameter(Mandatory)]
        [string]$Key,

        [Parameter(Mandatory)]
        [string]$Value
    )

    $Config = ReadEnvFile $ConfigPath

    SetConfigValue `
        -Config $Config `
        -Key $Key `
        -Value $Value

    WriteEnvFile `
        -File $ConfigPath `
        -Config $Config
}

# Configures via prompts
function ConfigureEnv
{
    param(
        [Parameter(Mandatory)]
        [string]$ConfigPath,
        [Parameter(Mandatory)]
        [hashtable[]]$Settings,
        [string]$Server
    )

    $Config = ReadEnvFile $ConfigPath $Server
    foreach ($setting in $Settings)
    {
        if (
            $setting.ContainsKey("Default") -and
            -not $Config.ContainsKey($setting.Key)
        )
        {
            $Config[$setting.Key] = $setting.Default
        }
    }


    LogHeader "Current Config"
    foreach ($setting in $Settings)
    {
        DisplayEnvValue `
            -Config $Config `
            -Key $setting.Key `
            -Prompt $setting.Prompt `
            -Secret:$($setting.Secret)
    }

    LogHeader "# to delete the entry"
    foreach ($setting in $Settings)
    {
        PromptEnvValue `
            -Config $Config `
            -Key $setting.Key `
            -Prompt $setting.Prompt `
            -Secret:$($setting.Secret)
    }

    WriteConfiguredEnvFile `
        -File $configPath `
        -Config $Config `
        -Settings $Settings `
        -Server $Server

    LogHeader "Modified Config"
    $Config = ReadEnvFile $configPath $Server
    foreach ($setting in $Settings)
    {
        DisplayEnvValue `
            -Config $Config `
            -Key $setting.Key `
            -Prompt $setting.Prompt `
            -Secret:$($setting.Secret)
    }

    return $Config
}