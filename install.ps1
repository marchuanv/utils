param($depModuleName)
$package=Load-NodePackage
$moduleName=$package.name
$repoUrl=$package.dependencies."$depModuleName"
Write-Host "installing and updating $moduleName with changes from $repoUrl"
npm update $repoUrl
npm install $repoUrl
$LASTEXITCODE=$true