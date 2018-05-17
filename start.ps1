Param (
    [string]$moduleName
)
& .\stop.ps1 $moduleName
node "node_modules\$moduleName.start.js"