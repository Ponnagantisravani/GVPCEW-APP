$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$appRoot = Join-Path $projectRoot "face-enrollment"
$distRoot = Join-Path $projectRoot "dist"
$workRoot = Join-Path $projectRoot "build\pyinstaller"
$specPath = Join-Path $appRoot "main.spec"
$exeName = "GVPCEW-Face-Enrollment.exe"

New-Item -ItemType Directory -Force -Path $distRoot | Out-Null
New-Item -ItemType Directory -Force -Path $workRoot | Out-Null

pyinstaller $specPath --clean --noconfirm --distpath $distRoot --workpath $workRoot

$rootExe = Join-Path $distRoot $exeName
$specExe = Join-Path $appRoot "dist\$exeName"

if (!(Test-Path $rootExe) -and (Test-Path $specExe)) {
    Copy-Item -Path $specExe -Destination $rootExe -Force
}

if (!(Test-Path $rootExe)) {
    throw "Build completed, but $exeName was not found in $distRoot."
}
