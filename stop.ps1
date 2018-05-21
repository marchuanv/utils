Param(
  [string]$serverModuleName
)
. .\shared.ps1
$stopFilePath="node_modules\$serverModuleName\$serverModuleName.stop.js"
[bool]$exists=Test-Path $stopFilePath
if ($exists -eq $true){
    $stopFilePath = Convert-Path $stopFilePath
    node $stopFilePath
    $LASTEXITCODE=$true
}else{
    $LASTEXITCODE=$false
}