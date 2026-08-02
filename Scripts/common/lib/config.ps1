function Get-EnvironmentConfig
{
    param(
        [Parameter(Mandatory)]
        [ValidateSet("development", "production", "localhost")]
        [string]$Environment,

        [Parameter(Mandatory)]
        [ValidateSet("api", "client")]
        [string]$Application
    )

    switch ("$Application-$Environment")
    {
        "api-development" {
            return @{
                UseDocker   = $true
                Server      = "pulse"
                PublishRoot = "/publish/api"
                ReleaseRoot = "/opt/pulse/development/releases"
                CurrentRoot = "/opt/pulse/development/current"
                Service     = "pulse-development"
            }
        }

        "api-production" {
            return @{
                UseDocker   = $true
                Server      = "pulse"
                PublishRoot = "/publish/api"
                ReleaseRoot = "/opt/pulse/production/releases"
                CurrentRoot = "/opt/pulse/production/current"
                Service     = "pulse-production"
            }
        }

        "client-development" {
            return @{
                UseDocker   = $true
                Server      = "pulse"
                PublishRoot = "/publish/client"
                ReleaseRoot = "/var/www/pulse/development/releases"
                CurrentRoot = "/var/www/pulse/development/current"
            }
        }

        "client-production" {
            return @{
                UseDocker   = $true
                Server      = "pulse"
                PublishRoot = "/publish/client"
                ReleaseRoot = "/var/www/pulse/production/releases"
                CurrentRoot = "/var/www/pulse/production/current"
            }
        }

        "api-localhost" {
            return @{
                UseDocker   = $true
                PublishRoot = "/publish/api/localhost"
            }
        }

        "client-localhost" {
            return @{
                UseDocker   = $true
                PublishRoot = "/publish/client"
            }
        }
    }
}