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
                PublishRoot = "/publish/api"
                Server      = "pulse"
                Port        = 5001
            }
        }

        "api-production" {
            return @{
                PublishRoot = "/publish/api"
                Server      = "pulse"
                Port        = 5000
            }
        }

        "client-development" {
            return @{
                Server      = "pulse"
                PublishRoot = "/publish/client"
            }
        }

        "client-production" {
            return @{
                Server      = "pulse"
                PublishRoot = "/publish/client"
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