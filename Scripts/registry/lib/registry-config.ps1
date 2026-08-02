function Get-RegistryConfig
{
    param(
        [Parameter(Mandatory)]
        [ValidateSet("development", "production", "localhost")]
        [string]$Environment
    )

    $Server = if ($Environment -eq "localhost") { "localhost" } else { "pulse" }

    $ServerUrl  = switch ($Environment)
    {
        "localhost"   { "" }
        "development" { "dev-registry.pulse-flow.app" }
        "production"  { "registry.pulse-flow.app" }
    }


    $Port = switch ($Environment)
    {
        "localhost"   { 5100 }
        "development" { 5101 }
        "production"  { 5100 }
    }

    $Secure = $false
    #  $Environment -eq "production"

    return @{
        Environment = $Environment

        ServerUrl  = $ServerUrl

        Server      = $Server
        Port        = $Port

        ConfigDir   = "/etc/pulse/registry/$Environment"
        ConfigFile  = "/etc/pulse/registry/$Environment/config.yml"
        
        AuthDir     = "/etc/pulse/registry/$Environment/auth"
        Htpasswd    = "/etc/pulse/registry/$Environment/auth/htpasswd"

        CertsDir    = "/etc/pulse/registry/$Environment/certs"

        Container   = "pulse-registry-$Environment"
        Volume      = "pulse-registry-$Environment"
        DataPath    = "/var/lib/pulse-$Environment-registry"
        Image       = "registry:3"

        Secure      = $Secure
        Public      = $true
    }
}

# sudo mkdir -p /etc/pulse/registry/development/auth
# sudo chown root:root /etc/pulse/registry/development/auth
# sudo chmod 755 /etc/pulse/registry/development/auth