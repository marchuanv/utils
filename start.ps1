Param(
    [string]$moduleName
)
. .\shared.ps1
Stop-NodeApp $moduleName
Start-NodeApp $moduleName