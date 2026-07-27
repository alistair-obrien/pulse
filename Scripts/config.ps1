function Get-EnvironmentConfig
{
    param(
        [Parameter(Mandatory)]
        [ValidateSet("Development", "Production", "Local")]
        [string]$Environment,

        [Parameter(Mandatory)]
        [ValidateSet("Api", "Web")]
        [string]$Application
    )

    switch ("$Application-$Environment")
    {
        "Api-Development" {
            return @{
                Server      = "pulse"
                PublishRoot = "/publish/api/development"
                ReleaseRoot = "/opt/pulse/development/releases"
                CurrentRoot = "/opt/pulse/development/current"
                Service     = "pulse-development"
            }
        }

        "Api-Production" {
            return @{
                Server      = "pulse"
                PublishRoot = "/publish/api/production"
                ReleaseRoot = "/opt/pulse/production/releases"
                CurrentRoot = "/opt/pulse/production/current"
                Service     = "pulse-production"
            }
        }

        "Web-Development" {
            return @{
                Server      = "pulse"
                PublishRoot = "/publish/web/development"
                ReleaseRoot = "/var/www/pulse/development/releases"
                CurrentRoot = "/var/www/pulse/development/current"
            }
        }

        "Web-Production" {
            return @{
                Server      = "pulse"
                PublishRoot = "/publish/web/production"
                ReleaseRoot = "/var/www/pulse/production/releases"
                CurrentRoot = "/var/www/pulse/production/current"
            }
        }

        "Api-Local" {
            return @{
                PublishRoot = "/publish/api/local"
            }
        }

        "Web-Local" {
            return @{
                PublishRoot = "/publish/web/local"
            }
        }
    }
}