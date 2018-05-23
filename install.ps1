. .\shared.ps1
$package=Load-NodePackage
$moduleName=$package.name

cls
Write-Host "INSTALLING $moduleName"
npm install .

cls
Write-Host "UPDATING $moduleName"
npm update .

cls
Write-Host "REMOVING SUBMODULES FOR $moduleName"
try {
    Remove-Submodules
}catch{
    Read-Host $_.Exception.Message
}

cls
Write-Host "INSTALLING SUBMODULES FOR $moduleName"
try {
    Add-Submodules
}catch{
    Read-Host $_.Exception.Message
}

$LASTEXITCODE=$true