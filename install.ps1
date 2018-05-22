$package=Load-NodePackage
$moduleName=$package.name
cls
Write-Host ""
Write-Host "INSTALLING $moduleName"
npm install .
cls
Write-Host "UPDATING $moduleName"
npm update .

. .\shared.ps1
$subModuleNames=$package.softDependencies | Select-Object -Property name
foreach($subModuleName in $subModuleNames){
    Remove-Submodules $subModuleName  
    Add-Submodules $subModuleName
}

$LASTEXITCODE=$true