$package= Load-NodePackage
$moduleName=$package.name
$stopFilePath="node_modules\$moduleName\$moduleName.stop.js"
$stopFilePath= Convert-Path $stopFilePath
node $stopFilePath