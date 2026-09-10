# Launch a dedicated Chrome instance with CDP enabled on 127.0.0.1:9227.
# Isolated profile: Chrome 136+ refuses remote debugging on the default one.

$ErrorActionPreference = 'Stop'

$candidates = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:LocalAppData\Google\Chrome\Application\chrome.exe"
)
$chrome = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $chrome) { throw "chrome.exe not found in the usual locations." }

$profileDir = Join-Path $env:USERPROFILE '.vurell-chrome'

Start-Process $chrome -ArgumentList @(
  '--remote-debugging-port=9227',
  '--remote-allow-origins=http://127.0.0.1:9227',
  "--user-data-dir=$profileDir",
  '--no-first-run',
  '--no-default-browser-check',
  'https://www.linkedin.com/feed/'
)

Write-Host "Chrome starting on 127.0.0.1:9227 (profile: $profileDir)"
Write-Host "Log in to LinkedIn there, then run: node tools/cdp_check.mjs"
