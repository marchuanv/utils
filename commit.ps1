. .\shared.ps1
cls
$package= Load-NodePackage
$packageName=$package.name
Write-Host ""
Write-Host "COMMITTING CHANGES FOR $packageName"
$moduleName=$package.name
[bool]$results= CommitAndPush-GitRepository
if ($results -eq $true){
    Write-Host "commited $moduleName changes."
    $LASTEXITCODE=$true
    exit 0
}else{
    Write-Host "there was nothing to commit for $moduleName"
    $LASTEXITCODE=$false
    exit 1
}