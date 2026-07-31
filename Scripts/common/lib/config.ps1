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
                Server      = "pulse"
                PublishRoot = "/publish/api"
                ReleaseRoot = "/opt/pulse/development/releases"
                CurrentRoot = "/opt/pulse/development/current"
                Service     = "pulse-development"
            }
        }

        "api-production" {
            return @{
                Server      = "pulse"
                PublishRoot = "/publish/api"
                ReleaseRoot = "/opt/pulse/production/releases"
                CurrentRoot = "/opt/pulse/production/current"
                Service     = "pulse-production"
            }
        }

        "client-development" {
            return @{
                Server      = "pulse"
                PublishRoot = "/publish/client"
                ReleaseRoot = "/var/www/pulse/development/releases"
                CurrentRoot = "/var/www/pulse/development/current"
            }
        }

        "client-production" {
            return @{
                Server      = "pulse"
                PublishRoot = "/publish/client"
                ReleaseRoot = "/var/www/pulse/production/releases"
                CurrentRoot = "/var/www/pulse/production/current"
            }
        }

        "api-localhost" {
            return @{
                PublishRoot = "/publish/api/localhost"
            }
        }

        "client-localhost" {
            return @{
                PublishRoot = "/publish/client"
            }
        }
    }
}