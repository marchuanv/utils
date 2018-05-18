$package= Load-NodePackage
$moduleName=$package.name
& .\stop.ps1
$startFilePath="node_modules\$moduleName\$moduleName.start.js"
$startFilePath= Convert-Path $startFilePath
node $startFilePath