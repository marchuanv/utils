Param (
    [string]$moduleName
)
. .\shared.ps1
Write-Host ""
Write-Host "COMMITTING $moduleName CHANGES"
[bool]$results= CommitAndPush-GitRepository $moduleName
exit $results