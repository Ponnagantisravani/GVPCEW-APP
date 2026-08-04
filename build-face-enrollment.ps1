$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$appRoot = Join-Path $projectRoot "face-enrollment"
$distRoot = Join-Path $projectRoot "dist"
$workRoot = Join-Path $projectRoot "build\\pyinstaller"
$specPath = Join-Path $appRoot "main.spec"

New-Item -ItemType Directory -Force -Path $distRoot | Out-Null
New-Item -ItemType Directory -Force -Path $workRoot | Out-Null

pyinstaller $specPath --noconfirm --distpath $distRoot --workpath $workRoot

$rootExe = Join-Path $distRoot "main.exe"
$specExe = Join-Path $appRoot "dist\\main.exe"

if (!(Test-Path $rootExe) -and (Test-Path $specExe)) {
    Copy-Item -Path $specExe -Destination $rootExe -Force
}

if (!(Test-Path $rootExe)) {
    throw "Build completed, but main.exe was not found in $distRoot."
}
