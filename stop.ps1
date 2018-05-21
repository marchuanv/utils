Param(
  [string]$serverModuleName
)
. .\shared.ps1
$stopFilePath="node_modules\$serverModuleName\$serverModuleName.stop.js"
$stopFilePath= Convert-Path $stopFilePath
node $stopFilePath
$LASTEXITCODE=$true