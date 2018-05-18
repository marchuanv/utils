. .\shared.ps1
$moduleName = Get-Location 
Write-Host ""
[bool]$results= CommitAndPush-GitRepository $moduleName
if ($results -eq $true){
    Write-Host "commited $moduleName changes."
    $LASTEXITCODE=$true
    exit 0
}else{
    Write-Host "there was nothing to commit for $moduleName"
    $LASTEXITCODE=$false
    exit 1
}