Param(
  [array]$subModuleNames
)
. .\shared.ps1
foreach($subModuleName in $subModuleNames){
    Remove-Submodules $subModuleName  
    Add-Submodules $subModuleName
}
