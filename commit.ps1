. .\shared.ps1
$moduleName = Get-Location 
Write-Host ""
[bool]$results= CommitAndPush-GitRepository $moduleName
if ($results -eq $true){
    Write-Host "COMMITTING $moduleName CHANGES"
    $LASTEXITCODE=$true
    exit 0
}else{
    Write-Host "NOTHING TO COMMITTING FOR $moduleName"
    $LASTEXITCODE=$false
    exit 0
}