Param(
  [array]$moduleNames
)

. .\shared.ps1

foreach($moduleName in $moduleNames){
    Remove-Submodule $moduleName  
    Add-Submodule $moduleName
}

