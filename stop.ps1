Param (
    [string]$moduleName
)


$stopFilePath="node_modules\$moduleName\$moduleName.stop.js"
$stopFilePath= Convert-Path $stopFilePath
node $stopFilePath