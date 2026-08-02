function DockerBuildImage
{
    param(
        [Parameter(Mandatory)]
        [string]$Dockerfile,

        [Parameter(Mandatory)]
        [string]$Context,

        [Parameter(Mandatory)]
        [string]$Image,

        [hashtable]$BuildArgs = @{}
    )

    $DockerArgs = @()

    foreach ($arg in $BuildArgs.GetEnumerator())
    {
        $DockerArgs += "--build-arg"
        $DockerArgs += "$($arg.Key)=$($arg.Value)"
    }

    docker build `
        -f $Dockerfile `
        -t $Image `
        @DockerArgs `
        $Context | Out-Host

    if ($LASTEXITCODE -ne 0)
    {
        throw "Docker build failed."
    }

    return [PSCustomObject]@{
        Type = "DockerImage"
        Image = $Image
        BuildArgs = $BuildArgs
    }
}

function InvokeDockerBuilder
{
    param(
        [string]$Source,
        [string]$Publish,
        [string]$Image,
        [string[]]$Command
    )

    LogHeader -Title "Building with Docker"

    docker run --rm `
        --mount "type=bind,src=$Source,dst=/src" `
        --mount "type=bind,src=$Publish,dst=/publish" `
        $Image `
        @Command | Out-Host

    if ($LASTEXITCODE -ne 0)
    {
        throw "Docker build failed."
    }

    LogFooter -Title "Built with Docker"
}

function DockerRegistryLogin
{
    param(
        [Parameter(Mandatory)]
        [string]$Registry
    )

    docker manifest inspect "$Registry/pulse-api:development" *> $null

    if ($LASTEXITCODE -eq 0)
    {
        return $true
    }

    Write-Host "Authentication required for Docker registry '$Registry'."

    $UserName = Read-Host "Enter Registry Username"
    $Password = Read-Host "Enter Registry Password" -AsSecureString

    $BSTR = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password)

    try
    {
        $PlainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($BSTR)

        $PlainPassword |
            docker login $Registry `
                --username $UserName `
                --password-stdin |
            Out-Host

        return ($LASTEXITCODE -eq 0)
    }
    finally
    {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
    }
}

# HACK: Not ideal as this does remote execution
function DockerRestartContainer
{
    param
    (
        [Parameter(Mandatory)]
        [ValidateSet("development", "production", "localhost")]
        [string]$Environment,

        [Parameter(Mandatory)]
        [ValidateSet("api")]
        [string]$Application
    )
    $ErrorActionPreference = "Stop"
        
    . "$PSScriptRoot/config.ps1"
    . "$PSScriptRoot/console-logger.ps1"
    . "$PSScriptRoot/invoke-remote.ps1"
    
    $Config = Get-EnvironmentConfig -Environment $Environment -Application Api
    
    LogHeader -Title "Restarting Docker Container" -Environment $Environment -Application $Application
    
    InvokeRemote $Config.Server "sudo docker restart pulse-$Application-$Environment"
    
    if ($LASTEXITCODE -ne 0)
    {
        throw "Restart failed."
    }
    
    LogFooter -Title "Restarted Docker Container"
}