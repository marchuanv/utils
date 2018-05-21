Param(
  [string]$serverModuleName
)
. .\shared.ps1
$stopFilePath="node_modules\$serverModuleName\$serverModuleName.stop.js"
[bool]$exists=Test-Path $stopFilePath
if ($exists -eq $true){
<<<<<<< HEAD
=======
    $stopFilePath = Convert-Path $stopFilePath
>>>>>>> 42188a6f0052a1480f031d61005f5edaa75c18ac
    node $stopFilePath
    $LASTEXITCODE=$true
}else{
    $LASTEXITCODE=$false
}