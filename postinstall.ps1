Param(
  [array]$subModuleNames
)
. .\shared.ps1
foreach($subModuleName in $subModuleNames){
    Remove-Submodule $subModuleName  
    Add-Submodule $subModuleName
}
