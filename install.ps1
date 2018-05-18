$package= Load-NodePackage 
$moduleName=$package.name
$repoUrl=$package.dependencies."$moduleName"
Write-Host "installing and updating $moduleName with changes from $repoUrl"
npm update $repoUrl
npm install $repoUrl
$LASTEXITCODE=$true