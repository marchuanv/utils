$package=Load-NodePackage
$moduleName=$package.name
cls
Write-Host ""
Write-Host "INSTALLING $moduleName"
npm install .
Write-Host "UPDATING $moduleName"
npm update .
$LASTEXITCODE=$true