Param (
    [string]$moduleName
)
node "node_modules\$moduleName.stop.js"