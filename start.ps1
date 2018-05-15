Param(
    [string]$moduleName,
    [int]$port
)
. .\shared.ps1
Stop-NodeApp $moduleName
Start-NodeApp $moduleName