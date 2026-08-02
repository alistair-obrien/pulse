param(
    [Parameter(Mandatory)]
    [ValidateSet("development", "production", "localhost")]
    [string]$Environment
)

. "$PSScriptRoot/../common/lib/console-logger.ps1"
. "$PSScriptRoot/../common/lib/docker.ps1"
. "$PSScriptRoot/postgres-db-config.ps1"

LogPipelineHeader -Title "Deploying Pulse Database" -Environment $Environment

$Config = Get-DatabaseConfig -Environment $Environment

DockerEnsureNetwork `
    -Server $Config.Server `
    -Network $Config.Network

DockerEnsureVolume `
    -Server $Config.Server `
    -Volume $Config.Volume

DockerRemoveContainer `
    -Server $Config.Server `
    -Container $Config.Container

# $Config.Config 

# -p 5432:5432
# --env-file $($Config.ConfigFile) 
DockerRunContainer `
    -Server $Config.Server `
    -Arguments "-d --name $($Config.Container) --restart unless-stopped --network $($Config.Network) -v $($Config.Volume):/var/lib/postgresql/data $($Config.Image)"

DockerLogContainer `
    -Server $Config.Server `
    -Container $Config.Container

# WaitForPostgres `
#     -Server $Config.Server `
#     -Container $Config.Container

LogPipelineFooter -Title "Pulse Database Deployed"