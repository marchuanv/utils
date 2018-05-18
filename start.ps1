Param (
    [string]$moduleName
)
& .\stop.ps1 $moduleName
node "node_modules\$moduleName\$moduleName.start.js"