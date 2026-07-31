function SetConfigValue
{
    param(
        [Parameter(Mandatory)]
        [hashtable]$Config,

        [Parameter(Mandatory)]
        [string]$Key,

        [Parameter(Mandatory)]
        [string]$Value
    )

    switch ($Value)
    {
        "" { }

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
        [string]$File
    )

    $config = [hashtable]@{}

    $lines = ssh pulse "sudo cat '$File'"

    foreach ($line in $lines)
    {
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
        [hashtable]$Config
    )

    $lines = foreach ($key in ($Config.Keys | Sort-Object))
    {
        if (-not [string]::IsNullOrWhiteSpace($Config[$key]))
        {
            "$key=$($Config[$key])"
        }
    }

    $text = $lines -join "`n"

    $text | ssh pulse "sudo tee '$File' > /dev/null"
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
        [hashtable[]]$Settings
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
        -Config $filtered
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
        [hashtable[]]$Settings
    )

    $Config = ReadEnvFile $ConfigPath

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
        -Settings $Settings

    LogHeader "Modified Config"
    $Config = ReadEnvFile $configPath
    foreach ($setting in $Settings)
    {
        DisplayEnvValue `
            -Config $Config `
            -Key $setting.Key `
            -Prompt $setting.Prompt `
            -Secret:$($setting.Secret)
    }
}