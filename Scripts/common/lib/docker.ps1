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
        [string]$Registry,

        [string]$Server
    )

    Write-Host "Authentication required for Docker registry '$Registry'."

    $UserName = Read-Host "Enter Registry Username"
    $Password = Read-Host "Enter Registry Password" -AsSecureString

    $BSTR = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password)

    try
    {
        $PlainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($BSTR)

        RunShellCommand `
            -Server $Server `
            -Command {
                param($Registry, $UserName, $Password)

                $Password |
                    docker login $Registry `
                        --username $UserName `
                        --password-stdin |
                    Out-Host
            } `
            -ArgumentList $Registry, $UserName, $PlainPassword `
            -ErrorMessage "Failed to log in to Docker registry."

        return $true
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
        [string]$Server,

        [Parameter(Mandatory)]
        [string]$Network
    )

    LogHeader -Title "Ensuring Docker Network '$Network'"

    RunShellCommand `
        -Server $Server `
        -Command {
            param($Network)

            docker network inspect $Network *> $null

            if ($LASTEXITCODE -ne 0)
            {
                docker network create $Network
            }
        } `
        -ArgumentList $Network `
        -ErrorMessage "Failed to ensure docker network."

    LogFooter -Title "Docker Network '$Network' Ready"
}

function DockerEnsureVolume
{
    param(
        [string]$Server,

        [Parameter(Mandatory)]
        [string]$Volume
    )

    LogHeader -Title "Ensuring Docker Volume '$Volume'"

    RunShellCommand `
        -Server $Server `
        -Command {
            param($Volume)

            docker volume inspect $Volume *> $null

            if ($LASTEXITCODE -ne 0)
            {
                docker volume create $Volume
            }
        } `
        -ArgumentList $Volume `
        -ErrorMessage "Failed to ensure docker volume."

    LogFooter -Title "Docker Volume '$Volume' Ready"
}

function DockerPullImage
{
    param(
        [string]$Server,

        [Parameter(Mandatory)]
        [string]$Image
    )

    LogHeader -Title "Pulling Docker Image $Image"

    RunShellCommand `
        -Server $Server `
        -Command "docker pull $Image" `
        -ErrorMessage "Failed to pull docker image."

    LogFooter -Title "Docker Image Pulled"
}

function DockerRemoveContainer
{
    param(
        [string]$Server,

        [Parameter(Mandatory)]
        [string]$Container
    )

    LogHeader -Title "Removing Docker Container '$Container'"

    RunShellCommand `
        -Server $Server `
        -Command {
            param($Container)

            $Exists = docker ps -a `
                --filter "name=^${Container}$" `
                --format "{{.Names}}"

            if ($Exists)
            {
                docker rm -f $Container
            }
        } `
        -ArgumentList $Container `
        -ErrorMessage "Failed to remove docker container."

    LogFooter -Title "Docker Container '$Container' Removed"
}

function DockerRunContainer
{
    param(
        [string]$Server,

        [Parameter(Mandatory)]
        [string]$Arguments
    )

    LogHeader -Title "Starting Docker Container"

    RunShellCommand `
        -Server $Server `
        -Command "docker run $Arguments" `
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
        [string]$Server,
        [Parameter(Mandatory)]
        [string]$Container
    )
        
    $command = "docker restart $Container"
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
        [string]$Server,

        [Parameter(Mandatory)]
        [string]$Container
    )

    LogHeader -Title "Logging Docker Container '$Container' on '$Server'"

    RunShellCommand `
        -Server $Server `
        -Command "docker logs -f $Container" `
        -ErrorMessage "Failed to stream docker logs."
}