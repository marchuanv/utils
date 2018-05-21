$package= Load-NodePackage
$moduleName=$package.name

$dependencies=Get-ObjectProperties $package.dependencies

Write-Host $dependencies

# $startFilePath="node_modules\$moduleName\$moduleName.start.js"
# $startFilePath= Convert-Path $startFilePath
# [bool]$exists=(Test-Path $startFilePath)
# if ($exists -eq $false){
#     $startFilePath="$moduleName.start.js"
#     $startFilePath= Convert-Path $startFilePath
# }
# node $startFilePath
$LASTEXITCODE=$true