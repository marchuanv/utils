$package=Load-NodePackage
$moduleName=$package.name
cls
Write-Host ""
Write-Host "INSTALLING $moduleName"
<<<<<<< HEAD
npm install .
cls
Write-Host "UPDATING $moduleName"
npm update .
=======
npm install
cls
Write-Host "UPDATING $moduleName"
npm update
>>>>>>> 42188a6f0052a1480f031d61005f5edaa75c18ac
$LASTEXITCODE=$true