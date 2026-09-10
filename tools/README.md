# Local Chrome for LinkedIn automation

The browser must run **on your own machine**, not in a cloud session: you have to
log in to LinkedIn by hand, and LinkedIn treats datacenter IPs as suspicious.
An agent can only drive it when it is running on the same machine (Claude Code CLI
locally), because `127.0.0.1:9227` is not reachable from anywhere else.

## 1. Start the browser

```
tools\start-chrome.cmd
```

or, from PowerShell:

```
powershell -ExecutionPolicy Bypass -File tools\start-chrome.ps1
```

Both launch Chrome with:

- `--remote-debugging-port=9227` — the CDP endpoint
- `--user-data-dir=%USERPROFILE%\.vurell-chrome` — a dedicated profile

The dedicated profile is not optional. Chrome 136+ refuses to expose remote
debugging on the default profile, and keeping this session separate means the
automation never touches your everyday browsing.

If a Chrome is already running on that profile, the new process just hands the
URL to it and exits without opening the port. Close those windows first.

## 2. Log in

The window opens on the LinkedIn feed. Log in normally — password, 2FA, any
checkpoint. The session cookie lives in `.vurell-chrome` and survives restarts,
so this is a one-time step per profile.

## 3. Verify the agent can see it

```
node tools/cdp_check.mjs
```

Prints the browser version, the open tabs, and whether the LinkedIn session is
logged in. Read-only — it never clicks or sends anything. Override the port with
`CDP_PORT` if you use something other than 9227.

Expected output when everything is ready:

```
Browser : Chrome/141.0.0.0
Endpoint: http://127.0.0.1:9227
Tabs    : 1
  - Feed | LinkedIn :: https://www.linkedin.com/feed/

Logged in - LinkedIn nav is present. Browser is ready to drive.
```

## Sending rules

Connecting to the browser is not permission to message anyone. Any run that
sends invitations or DMs still requires, per the project's sending rules:

1. the exact note text and the exact recipient list approved before the run;
2. all five send-outreach hard stops per recipient, including re-reading the
   thread immediately before sending and aborting on any outbound;
3. the Connect control matched to the target profile's own vanity name, never a
   sidebar recommendation;
4. the invite modal actually appearing — otherwise the attempt is recorded as
   NOT SENT, not assumed sent.
