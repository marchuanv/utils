$package= Load-NodePackage
$moduleName=$package.name
$startFilePath="node_modules\$moduleName\$moduleName.start.js"
$startFilePath= Convert-Path $startFilePath
[bool]$exists=(Test-Path $startFilePath)
if ($exists -eq $false){
    $startFilePath="$moduleName.start.js"
    $startFilePath= Convert-Path $startFilePath
}
node $startFilePath