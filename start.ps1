Param(
  [string]$serverModuleName
)
. .\shared.ps1
$startFilePath="node_modules\$serverModuleName\$serverModuleName.start.js"
$startFilePath= Convert-Path $startFilePath
node $startFilePath
$LASTEXITCODE=$true