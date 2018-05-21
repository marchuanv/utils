Param(
  [string]$serverModuleName
)
. .\shared.ps1
$startFilePath="node_modules\$serverModuleName\$serverModuleName.start.js"
[bool]$exists=Test-Path $startFilePath
if ($exists -eq $true){
<<<<<<< HEAD
=======
    $startFilePath = Convert-Path $startFilePath
>>>>>>> 42188a6f0052a1480f031d61005f5edaa75c18ac
    node $startFilePath
    $LASTEXITCODE=$true
}else{
    $LASTEXITCODE=$false
}