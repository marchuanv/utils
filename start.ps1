Param (
    [string]$moduleName
)
& .\stop.ps1 $moduleName

$startFilePath="node_modules\$moduleName\$moduleName.start.js"
$startFilePath= Convert-Path $startFilePath
node $startFilePath