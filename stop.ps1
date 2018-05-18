Param (
    [string]$moduleName
)
node "node_modules\$moduleName\$moduleName.stop.js"