. .\shared.ps1
$package=Load-NodePackage
$moduleName=$package.name
cls
Write-Host ""
Write-Host "INSTALLING $moduleName"
npm install .
cls
Write-Host "UPDATING $moduleName"
npm update .

Write-Host "INSTALLING SUBMODULES FOR $moduleName"
Remove-Submodules
Add-Submodules

$LASTEXITCODE=$true