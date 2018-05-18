. .\shared.ps1
$moduleName = Get-Location 
Write-Host ""
[bool]$results= CommitAndPush-GitRepository $moduleName
if ($results -eq $true){
    Write-Host "COMMITTING $moduleName CHANGES"
    $LASTEXITCODE=$true
}else{
    Write-Host "NOTHING TO COMMITTING FOR $moduleName"
    $LASTEXITCODE=$false
}