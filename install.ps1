$package=Load-NodePackage
$moduleName=$package.name
cls
Write-Host ""
Write-Host "INSTALLING $moduleName"
npm install
cls
Write-Host "UPDATING $moduleName"
npm update
$LASTEXITCODE=$true