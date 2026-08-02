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