[string]$currentdirectory=(Get-Item -Path ".\").FullName
Write-Host "script location: $currentdirectory"

Function Get-PowershellAlias{
    if ($IsLinux -eq $true){
        return "pwsh"
    }else{
        return "@powershell"
    }
}

Function Load-Config {
    $jsonconfigfile=Join-Path -Path $currentdirectory -ChildPath config.json
    Write-Host "reading config from $jsonconfigfile"
    return (Get-Content $jsonconfigfile | Out-String | ConvertFrom-Json)
}

Function Save-Config ($config) {
    $jsonconfigfile=Join-Path -Path $currentdirectory -ChildPath config.json
    Write-Host "saving config to $jsonconfigfile"
    $config | ConvertTo-Json -depth 100 | Set-Content $jsonconfigfile
}

Function Load-NodePackage ($packageName) {
    $packageJsonFile=Join-Path -Path $currentdirectory -ChildPath $packageName\package.json
    Write-Host "reading node package from $packageJsonFile"
    return (Get-Content $packageJsonFile | Out-String | ConvertFrom-Json)
}

Function Save-NodePackage($package) {
    $packageName=$package.name
    $packageJsonFile=Join-Path -Path $currentdirectory -ChildPath "$packageName/package.json"
    Write-Host "saving node package to $packageJsonFile"
    $package | ConvertTo-Json -depth 100 | Set-Content $packageJsonFile
}

Function Get-NodePackages {
    $packages=New-Object System.Collections.ArrayList
    $allConfig=Load-Config
    foreach($config in $allConfig){
      $package=Load-NodePackage $config.name
      $null=$packages.Add($package)
    }
    return $packages
}

Function Switch-ToCurrentDirectory {
    cd $currentdirectory
    return $currentdirectory
}

Function Add-Submodule {
    [cmdletbinding()]
    Param (
        [string]$moduleName=""
    )
    $repoUrl="https://github.com/marchuanv/$moduleName.git"
    git submodule add $repoUrl
    git submodule init
    git submodule update
}


Function Remove-Submodule {
    [cmdletbinding()]
    Param (
        [string]$moduleName=""
    )
    $count=0
    $gitmodulesFilePath="$currentdirectory\.gitmodules"
    $lines= New-Object System.Collections.ArrayList
    foreach($line in Get-Content $gitmodulesFilePath) {
        $match="[submodule `"$moduleName`"]"
        if($line -contains $match -or ($count -lt 3 -and $count -gt 0) ) {
            $count++
            $remove=$true
        }else{
            $count=0
            $null=$lines.Add($line)
        }
    }
    $fileData=$lines -join "`r`n"
    Set-Content $gitmodulesFilePath -Value $fileData
    git add -A
    git rm --cached "$moduleName"
    $exists= Test-Path ".git/modules/$moduleName"
    if ($exists -eq $true){
        Remove-Item -Recurse -Force ".git/modules/$moduleName"
    }
    $exists= Test-Path $moduleName
    if ($exists -eq $true){
        Remove-Item -Recurse -Force $moduleName
    }
    git add -A
    git commit -m "commiting before the removal of $moduleName"
    git push origin master
}

Function Clone-GitRepository{
    [cmdletbinding()]
    Param (
        [string]$moduleName=""
    )
    $repoUrl="https://github.com/marchuanv/$moduleName.git"
    [string]$results= (git clone $repoUrl 2>&1)
    if ($results.Contains("'https://github.com/marchuanv/$moduleName.git/' not found"))
    {
        Write-Host ""
        Write-Host $results
        return $false
    }
    Write-Host ""
    Write-Host $results
    return $true
}

Function CommitAndPush-GitRepository {
    [cmdletbinding()]
    Param (
        [string]$moduleName
    )
    
    $Null= @(
        git checkout master
        git push origin master
        git pull origin master
    ) 

    [string]$results=git status
    [bool]$hasCommits=$false
    if ($results.Contains("nothing to commit"))
    {
        Write-Host "NOTHING TO COMMIT FOR $moduleName"
        return $hasCommits
    }
    else
    {
        $Null= @(
            Write-Host "COMMITING AND PUSHING CHANGES FOR $moduleName"
            $hasCommits=$true
            [array]$detachedHeads=@(git branch | select-string "HEAD detached at" | Foreach {$_.Line.Trim().Replace("* (HEAD detached at ","").Replace(")","").Replace(" ","")})

            foreach($head in $detachedHeads){
                git merge "$head"
            }
            git branch temp
            git checkout temp
            git add -A
            git commit -m "automated commit"
            git fetch
            git rebase temp
            git checkout master
            git merge temp
            git push origin master
            git branch -D temp
            git clean -fdx
        )
        return $hasCommits
    }
}

Function Create-PackageDependencies ($appName, [array]$modules) {

    [string]$dependencies=""
    [int]$noDep=$modules.Length
    for($i = 0; $i -lt $noDep; $i++)
    { 
        $module=$modules[$i]
        [string]$moduleName=$module.name
        Write-Host "adding $moduleName as a package dependency to the $appName package.json"
        [string]$dependency = "`"$moduleName`":`"git+https://github.com/marchuanv/$moduleName.git`","
        if ($i -eq ($noDep-1)){
            $dependency=$dependency.Replace(",","")
        }
        $dependencies="$dependencies$dependency"
    }
    $json="{`"dependencies`":{$dependencies}}"
    return ( $json | ConvertFrom-Json).dependencies
}

Function Get-ModuleDependencies ($moduleName, $modules) {
    if ($modules -eq $null){
        $modules=Load-Config
    }
    $dependantModules=New-Object System.Collections.ArrayList
    foreach($module in $modules) {
        if ($module.name -eq $moduleName) {
            foreach($modRef in $module.modules) {
                $null=$dependantModules.Add($modRef)
            }
        }
    }
    $len=$dependantModules.Count
    Write-Host "$moduleName has $len dependencies."
    return $dependantModules
}

Function Get-ModulesThatDependOnModule($moduleName, $modules) {
    if ($modules -eq $null){
        $modules=Load-Config
    }
    Write-Host "finding all modules that depend on $moduleName"
    $modulesFound=New-Object System.Collections.ArrayList
    foreach($module in $modules) {
        [array]$depModuleNames=$module.modules | Select-Object -ExpandProperty name
        if ($depModuleNames -contains $moduleName) {
            $null=$modulesFound.Add($module)
        }
    }
    return $modulesFound
}

Function Get-ModulesForModuleDependencies($moduleName, $modules) {
    if ($modules -eq $null){
        $modules=Load-Config
    }
    $dependantModules=New-Object System.Collections.ArrayList
    foreach($module in $modules) {
        if ($module.name -eq $moduleName) {
            foreach($depModule in $module.modules) {
                $depModuleName=$depModule.name
                foreach($module2 in $modules) {
                    if ($module2.name -eq $depModuleName){
                        $null=$dependantModules.Add($module2)
                    }
                }
            }
        }
    }
    $len=$dependantModules.Count
    Write-Host "$moduleName has $len dependencies."
    return $dependantModules
}

Function Get-SoftReferencedModules ($moduleName, $modules) {
    if ($modules -eq $null){
        $modules=Load-Config
    }
    [array]$referencedModules=Get-ModuleDependencies $moduleName $modules
    $softreferencedModules=New-Object System.Collections.ArrayList
    foreach($referencedModule in $referencedModules){
        if ($referencedModule.ishardreference -eq $false){
            $null=$softreferencedModules.Add($referencedModule)
        }
    }
    $len=$softreferencedModules.Count
    Write-Host "$moduleName has $len soft dependencies."
    return $softreferencedModules
}

Function Get-HardReferencedModules ($moduleName, $modules) {
    
    [array]$referencedModules=Get-ModuleDependencies $moduleName $modules
    $hardreferencedModules=New-Object System.Collections.ArrayList
    foreach($referencedModule in $referencedModules){
        if ($referencedModule.ishardreference -eq $true){
            $null=$hardreferencedModules.Add($referencedModule)
        }
    }
    $len=$hardreferencedModules.Count
    Write-Host "$moduleName has $len hard dependencies."
    return $hardreferencedModules
}

Function Get-ServerModule ($moduleName){
    Write-Host ""
    Write-Host "getting server modules for $moduleName"
    
    $hardModuleReferenceNames = Get-HardReferencedModules $moduleName | Select-Object -ExpandProperty name
    $allModules = Get-ModulesForModuleDependencies $moduleName

    [array]$serverDepModules= $allModules | Where-Object { $_.isserver -eq $true -and $hardModuleReferenceNames -contains $_.name }
    if ($serverDepModules.Length -eq 0){
        foreach($depModule in $depModules) {
            $depModuleName=$depModule.name
            $results=Get-ServerModule $depModuleName
            if ($results.Length -gt 0){
                return $results
            }
        }
    } else {
        [array]$modules=$serverDepModules | Select-Object -first 1
        return $modules[0]
    }
}

Function Sort-Modules {

    $modules=Load-Config
    $orderedModulesNames=New-Object System.Collections.ArrayList

    foreach($module in $modules){
        if ($module.modules.Count -eq 0){
            $null=$orderedModulesNames.Add($module.name)
        }
    }
    
    for($i=0; $i -lt $orderedModulesNames.Count; $i++)
    {
        $moduleName = $orderedModulesNames[$i]
        foreach($othermodule in $modules)
        {
            if (($orderedModulesNames -contains $othermodule.name) -eq $false){
                if ($othermodule.name -ne $moduleName){
                    [array]$othermodulenames = ($othermodule.modules | Select-Object -ExpandProperty name)
                    if ($othermodulenames -contains $moduleName ){
                        $null=$orderedModulesNames.Add($othermodule.name)
                    }
                }
            }
        }
    }
    
    $modules = $modules | Sort-Object -Property @{Expression={return [array]::indexof($orderedModulesNames,$_.name)}}
    Save-Config $modules
}