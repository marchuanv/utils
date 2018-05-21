$package=Load-NodePackage
$moduleName=$package.name
cls
Write-Host ""
Write-Host "installing and updating $moduleName"
npm install .
npm update .
$LASTEXITCODE=$true