Function Get-PowershellAlias{
    if ($IsLinux -eq $true){
        return "pwsh"
    }else{
        return "@powershell"
    }
}

Function Load-NodePackage ($packageName) {
    if ($packageName -eq "" -or $packageName -eq $null){
        $packageName="."
    }
    $packageJsonFile=Convert-Path $packageName\package.json
    Write-Host "reading node package from $packageJsonFile"
    return (Get-Content $packageJsonFile | Out-String | ConvertFrom-Json)
}

Function Save-NodePackage($package) {
    $packageName=$package.name
    $packageJsonFile=""
    if ($packageName -eq ""){
        $packageJsonFile=Convert-Path package.json
    }else{
        $packageJsonFile=Convert-Path $packageName\package.json
        
    }
    Write-Host "saving node package to $packageJsonFile"
    $package | ConvertTo-Json -depth 100 | Set-Content $packageJsonFile
}

Function Add-Submodules {
    $package=Load-NodePackage
    foreach($submodule in $package.submodules){
        $submodulename=$submodule.name
        $repoUrl=$submodule.repositoryurl
        Write-Host "Adding submodule from $repoUrl"
        git submodule add $repoUrl
        git submodule init $submodulename
        git submodule update $submodulename
    }
}

Function Remove-Submodules {
    $package=Load-NodePackage
    foreach($submodule in $package.submodules){
        $submodulename=$submodule.name
        $count=0
        $lines= New-Object System.Collections.ArrayList
        $gitmodulesFilePath= Convert-Path .gitmodules
        foreach($line in Get-Content $gitmodulesFilePath) {
            $match="[submodule `"$submodulename`"]"
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
        git rm --cached "$submodulename"
        $exists= Test-Path ".git/modules/$submodulename"
        if ($exists -eq $true){
            Remove-Item -Recurse -Force ".git/modules/$submodulename"
        }
        $exists= Test-Path $submodulename
        if ($exists -eq $true){
            Remove-Item -Recurse -Force $submodulename
        }
        git add -A
        git commit -m "commiting before the removal of $submodulename"
        git push origin master
    }
}

Function CommitAndPush-GitRepository {
    $Null= @(
        git checkout master
        git push origin master
        git pull origin master
    ) 

    [string]$results=git status
    [bool]$hasCommits=$false
    if ($results.Contains("nothing to commit"))
    {
        return $hasCommits
    }
    else
    {
        $Null= @(
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
        $package=Load-NodePackage
        $modules=$package.submodules 
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
        $package=Load-NodePackage
        $modules=$package.submodules 
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
        $package=Load-NodePackage
        $modules=$package.submodules 
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
        $package=Load-NodePackage
        $modules=$package.submodules
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

    $package=Load-NodePackage
    $modules=$package.submodules
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
    Save-NodePackage $package
}

Function Get-ObjectProperties ($object) {
    [array]$properties=$object.PSObject.Properties | ForEach-Object {
        $_.Name
        $_.Value
    }
    return $properties
}