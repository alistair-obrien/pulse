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
                Port        = 5001
            }
        }

        "api-production" {
            return @{
                Server      = "pulse"
                Port        = 5000
            }
        }

        "client-development" {
            return @{
                Server      = "pulse"
            }
        }

        "client-production" {
            return @{
                Server      = "pulse"
            }
        }

        "api-localhost" {
            return @{
            }
        }

        "client-localhost" {
            return @{
            }
        }
    }
}