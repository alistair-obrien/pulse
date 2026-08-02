function Get-DatabaseConfig
{
    param(
        [Parameter(Mandatory)]
        [ValidateSet("development", "production", "localhost")]
        [string]$Environment
    )

    switch ("$Environment")
    {
        "localhost" {
            return @{
                Server        = "localhost"
                Container     = "pulse-postgres-localhost"
                Volume        = "pulse-postgres-localhost"
                Network       = "pulse-localhost"
                Image         = "postgres:17"
                Port          = 5432
                ConfigFile    = "/etc/pulse/config/database/localhost.env" # TODO
            }
        }
        "development" {
            return @{
                Server        = "pulse"
                Container     = "pulse-postgres-development"
                Volume        = "pulse-postgres-development"
                Network       = "pulse-development"
                Image         = "postgres:17"
                Port          = 5432
                ConfigFile    = "/etc/pulse/config/database/development.env"
            }
        }
        "production" {
            return @{
                Server        = "pulse"
                Container     = "pulse-postgres-production"
                Volume        = "pulse-postgres-production"    
                Network       = "pulse-production"
                Image         = "postgres:17"
                Port          = 5432
                ConfigFile    = "/etc/pulse/config/database/production.env"
            }
        }
    }
}