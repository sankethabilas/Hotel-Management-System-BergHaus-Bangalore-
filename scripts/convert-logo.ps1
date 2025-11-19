Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path $PSScriptRoot -Parent
$source = Join-Path $projectRoot 'frontend\public\logo.jpg'
$target = Join-Path $projectRoot 'frontend\public\logo.png'

if (-not (Test-Path $source)) {
  throw "Missing source logo file at $source"
}

$image = [System.Drawing.Image]::FromFile($source)
try {
  $image.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)
} finally {
  $image.Dispose()
}

