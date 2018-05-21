$package=Load-NodePackage
$moduleName=$package.name
Write-Host "installing and updating $moduleName"
npm install .
npm update .
$LASTEXITCODE=$true