@echo off
REM Launch a dedicated Chrome instance with CDP enabled on 127.0.0.1:9227.
REM Uses an isolated profile so it never touches the everyday Chrome profile.
REM Chrome 136+ refuses remote debugging on the default profile, hence --user-data-dir.

set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" (
  echo Chrome not found. Edit CHROME in this file to point at chrome.exe.
  exit /b 1
)

start "" "%CHROME%" ^
  --remote-debugging-port=9227 ^
  --remote-allow-origins=http://127.0.0.1:9227 ^
  --user-data-dir="%USERPROFILE%\.vurell-chrome" ^
  --no-first-run ^
  --no-default-browser-check ^
  https://www.linkedin.com/feed/

echo Chrome starting on 127.0.0.1:9227 with profile %USERPROFILE%\.vurell-chrome
echo Log in to LinkedIn in that window, then run: node tools/cdp_check.mjs
