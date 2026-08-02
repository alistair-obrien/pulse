. "$PSScriptRoot/console-logger.ps1"
. "$PSScriptRoot/run-shell-command.ps1"

# ALWAYS LOCAL
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
    $BuildArgString = ($DockerArgs -join " ")

    RunShellCommand `
        -Command "docker build -f $Dockerfile -t $Image $BuildArgString $Context" `
        -ErrorMessage "Failed to build image $DockerFile $Context $Image."

    return [PSCustomObject]@{
        Type = "DockerImage"
        Image = $Image
        BuildArgs = $BuildArgs
    }
}

function DockerRegistryLogin
{
    param(
        [Parameter(Mandatory)]
        [string]$Registry
    )

    # Is Docker already authenticated?
    try
    {
        Invoke-WebRequest "https://$Registry/v2/" -UseBasicParsing
        return $true
    }
    catch
    {
        if ($_.Exception.Response.StatusCode -eq 401)
        {
            # Registry requires authentication.
            # This DOES NOT mean Docker isn't already logged in.
        }
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

# SELECTED HOST
function DockerEnsureNetwork
{
    param(
        [Parameter(Mandatory)]
        [string]$Server,

        [Parameter(Mandatory)]
        [string]$Network
    )

    LogHeader -Title "Ensuring Docker Network '$Network'"

    $command = @(
        "sudo docker network inspect $Network > /dev/null 2>&1 ||"
        "sudo docker network create $Network"
    ) -join "`n"

    RunShellCommand `
        -Server $Server `
        -Command $command `
        -ErrorMessage "Failed to ensure docker network."

    LogFooter -Title "Docker Network '$Network' Ready"
}

function DockerEnsureVolume
{
    param(
        [Parameter(Mandatory)]
        [string]$Server,

        [Parameter(Mandatory)]
        [string]$Volume
    )

    LogHeader -Title "Ensuring Docker Volume '$Volume'"

    $command = @(
        "sudo docker volume inspect $Volume > /dev/null 2>&1 ||"
        "sudo docker volume create $Volume"
    ) -join "`n"

    RunShellCommand `
        -Server $Server `
        -Command $command `
        -ErrorMessage "Failed to ensure docker volume."

    LogFooter -Title "Docker Volume '$Volume' Ready"
}

function DockerPullImage
{
    param(
        [Parameter(Mandatory)]
        [string]$Server,

        [Parameter(Mandatory)]
        [string]$Image
    )

    LogHeader -Title "Pulling Docker Image $Image"

    RunShellCommand `
        -Server $Server `
        -Command "sudo docker pull $Image" `
        -ErrorMessage "Failed to pull docker image."

    LogFooter -Title "Docker Image Pulled"
}

function DockerRemoveContainer
{
    param(
        [Parameter(Mandatory)]
        [string]$Server,

        [Parameter(Mandatory)]
        [string]$Container
    )

    LogHeader -Title "Removing Docker Container '$Container'"

    $command = @(
        "sudo docker rm -f $Container 2>/dev/null || true"
    ) -join "`n"

    RunShellCommand `
        -Server $Server `
        -Command $command `
        -ErrorMessage "Failed to remove docker container."

    LogFooter -Title "Docker Container '$Container' Removed"
}

function DockerRunContainer
{
    param(
        [Parameter(Mandatory)]
        [string]$Server,

        [Parameter(Mandatory)]
        [string]$Arguments
    )

    LogHeader -Title "Starting Docker Container"

    RunShellCommand `
        -Server $Server `
        -Command "sudo docker run $Arguments" `
        -ErrorMessage "Failed to run docker container."

    LogFooter -Title "Docker Container Started"
}

# Do later
function DockerWaitForContainer
{

}

function DockerRestartContainer
{
    param(
        [Parameter(Mandatory)]
        [string]$Server,
        [Parameter(Mandatory)]
        [string]$Container
        )
        
    $command = "sudo docker restart $Container"
    LogHeader -Title "Restarting Docker Container '$Container' on '$Server'"

    RunShellCommand `
        -Server $Server `
        -Command $command `
        -ErrorMessage "Failed to restart container."

    LogFooter -Title "Restarted Docker Container '$Container' on '$Server'"
}

function DockerLogContainer
{
    param(
        [Parameter(Mandatory)]
        [string]$Server,

        [Parameter(Mandatory)]
        [string]$Container
    )

    LogHeader -Title "Logging Docker Container '$Container' on '$Server'"


    RunShellCommand `
        -Server $Server `
        -Command "sudo docker logs -f $Container" `
        -ErrorMessage "Failed to stream docker logs."
}