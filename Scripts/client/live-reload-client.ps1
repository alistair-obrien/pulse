param(
    [ValidateSet("localhost", "development", "production")]
    [string]$Environment,

    [ValidateSet("web", "android", "ios")]
    [string]$Platform
)
$ErrorActionPreference = "Stop"

. "$PSScriptRoot/../common/lib/console-logger.ps1"
. "$PSScriptRoot/lib/build-client.ps1"

LogPipelineHeader -Title "Starting Live Session" -Environment $Environment -Platform $Platform

$BuiltPath = BuildClient -Environment $Environment -Platform $Platform

# Move to the correct working folder
$ProjectRoot = Resolve-Path "$PSScriptRoot/../../Frontend - Vanilla Web"
Push-Location $ProjectRoot

LogHeader -Title "Starting Vite Server" -Environment $Environment -Platform $Platform
Start-Process npx.cmd -ArgumentList "vite", "--host", "--mode", $Environment
if ($Platform -eq "web")
{    
    Pop-Location
    return
}

$CapPort="5173" # Same as Vite
$CapHost = (
    Get-NetRoute -DestinationPrefix "0.0.0.0/0" |
    Sort-Object RouteMetric |
    Select-Object -First 1 |
    ForEach-Object {
        Get-NetIPAddress -InterfaceIndex $_.InterfaceIndex -AddressFamily IPv4
    }
).IPAddress
do
{
    Start-Sleep -Milliseconds 250
}
until (Test-NetConnection $CapHost -Port $CapPort -InformationLevel Quiet)
LogFooter -Title "Vite Server Started"

$BuiltPath = (Resolve-Path $BuiltPath).Path

LogHeader -Title "Running Capacitor Run" -Environment $Environment -Platform $Platform
$env:PULSE_WEB_DIR = $BuiltPath
npx cap copy $Platform
npx cap run $Platform --live-reload --host $CapHost --port $CapPort
Remove-Item Env:PULSE_WEB_DIR

LogFooter -Title "Capacitor Run Ran"

Pop-Location
LogPipelineFooter -Title "Live Session Started"