$package= Load-NodePackage
$moduleName=$package.name


$stopFilePath="node_modules\$moduleName\$moduleName.stop.js"
$stopFilePath= Convert-Path $stopFilePath
[bool]$exists=(Test-Path $stopFilePath)
if ($exists -eq $false){
    $stopFilePath="$moduleName.stop.js"
    $stopFilePath= Convert-Path $startFilePath
}
node $stopFilePath
$LASTEXITCODE=$true