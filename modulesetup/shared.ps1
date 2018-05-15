[string]$currentdirectory=(Get-Item -Path ".\").FullName
Write-Host "script location: $currentdirectory"

Function WaitForEvent($moduleName, $eventName) {
    $eventFound=$false
    do{
        sleep 5
        $filePath="$currentdirectory\$moduleName\node_modules\libraryhost\events.json"
        $events=Get-Content "$filePath" | Out-String | ConvertFrom-Json
        foreach($_event in $events){
            if ($_event.name==$eventName){
                $eventFound=$true
            }
        }
    }
    while ($eventFound -eq $false)
}

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

Function Load-PackageTemplate () {
    $packageJsonFile=Join-Path -Path $currentdirectory -ChildPath "package.tpl.json"
    Write-Host "reading template package from $packageJsonFile"
    return (Get-Content $packageJsonFile | Out-String | ConvertFrom-Json)
}

Function Load-NodePackage ($moduleName) {
    $packageJsonFile=Join-Path -Path $currentdirectory -ChildPath $moduleName\package.json
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

Function Get-CurrentDirectory {
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
        [string]$moduleName=""
    )
    Write-Host "Switching to $currentdirectory\$moduleName" 
    cd $currentdirectory\$moduleName
    
    Write-Host ""
    
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
        cd $currentdirectory
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

            cd $currentdirectory
        )
        return $hasCommits
    }
}

Function InstallPackage {
    [cmdletbinding()]
    Param (
        [string]$moduleName=""
    )
    $workingDir= "$currentdirectory\$moduleName"
    cd $workingDir
    npm install
    cd $currentdirectory
}

Function RunNodeApp {
    [cmdletbinding()]
    Param (
        [string]$moduleName=""
    )
    $workingDir= "$currentdirectory\$moduleName"
    Write-Host "STARTING $moduleName at $workingDir"
    Start-Process -FilePath "pwsh" -WorkingDirectory "$workingDir" -ArgumentList "/c npm start 2>&1 | Out-File nohup.out"
}

Function StopNodeApp {
    [cmdletbinding()]
    Param (
        [string]$moduleName=""
    )
    $workingDir= "$currentdirectory\$moduleName"
    Write-Host "STOPPING $moduleName at $workingDir"
    Start-Process -FilePath "pwsh" -WorkingDirectory "$workingDir" -ArgumentList "/c npm stop 2>&1 | Out-File nohup.out"
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


Function Get-ReferencedModules ($moduleName) {
    $modules=Load-Config
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

Function Get-ModuleDependencies ($moduleName) {
    $modules=Load-Config
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

Function Get-SoftReferencedModules ($moduleName) {
    $modules=Load-Config
    [array]$referencedModules=Get-ModuleDependencies $moduleName
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

Function Get-HardReferencedModules ($moduleName) {
    
    [array]$referencedModules=Get-ModuleDependencies $moduleName
    $hardreferencedModules=New-Object System.Collections.ArrayList
    foreach($referencedModule in $referencedModules){
        if ($referencedModule.ishardreference -eq $true){
            Write-Host "Adding "
            $null=$hardreferencedModules.Add($referencedModule)
        }
    }
    $len=$hardreferencedModules.Count
    Write-Host "$moduleName has $len hard dependencies."
    return $hardreferencedModules
}

Function Get-ServerModule ($moduleName){
    $depModules = Get-ReferencedModules $moduleName
    [array]$serverDepModules= $depModules | Where-Object {$_.isserver -eq $true}
    if ($serverDepModules.Length -eq 0){
        foreach($depModule in $depModules) {
            $depModuleName=$depModule.name
            Get-ServerModule $depModuleName
        }
    } else {
        return $serverDepModules[0]
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