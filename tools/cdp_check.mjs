// Verifies the dedicated Chrome on 127.0.0.1:9227 is reachable over CDP and
// reports whether the LinkedIn session in it is logged in.
// Read-only: it never clicks, sends or navigates anywhere but the feed.
// Requires Node 22+ (global fetch and WebSocket).

const PORT = Number(process.env.CDP_PORT ?? 9227);
const HOST = `http://127.0.0.1:${PORT}`;

async function http(path) {
  const res = await fetch(`${HOST}${path}`);
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`);
  return res.json();
}

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  const pending = new Map();
  let id = 0;

  const ready = new Promise((resolve, reject) => {
    ws.addEventListener('open', () => resolve(), { once: true });
    ws.addEventListener('error', () => reject(new Error('websocket failed')), { once: true });
  });

  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    const slot = pending.get(msg.id);
    if (!slot) return;
    pending.delete(msg.id);
    msg.error ? slot.reject(new Error(msg.error.message)) : slot.resolve(msg.result);
  });

  return {
    ready,
    send(method, params = {}) {
      const msgId = ++id;
      return new Promise((resolve, reject) => {
        pending.set(msgId, { resolve, reject });
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    },
    close: () => ws.close(),
  };
}

async function evaluate(session, expression) {
  const { result } = await session.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  return result.value;
}

async function main() {
  let version;
  try {
    version = await http('/json/version');
  } catch (err) {
    console.error(`Cannot reach CDP on ${HOST}: ${err.message}`);
    console.error('Start the browser first: tools\\start-chrome.cmd (or start-chrome.ps1)');
    process.exit(1);
  }

  console.log(`Browser : ${version.Browser}`);
  console.log(`Endpoint: ${HOST}`);

  const targets = (await http('/json/list')).filter((t) => t.type === 'page');
  console.log(`Tabs    : ${targets.length}`);
  for (const t of targets) console.log(`  - ${t.title} :: ${t.url}`);

  const tab = targets.find((t) => t.url.includes('linkedin.com')) ?? targets[0];
  if (!tab) {
    console.error('No page target open. Open a tab in that Chrome window and re-run.');
    process.exit(1);
  }

  const session = connect(tab.webSocketDebuggerUrl);
  await session.ready;
  await session.send('Runtime.enable');

  const href = await evaluate(session, 'location.href');
  if (!href.includes('linkedin.com')) {
    console.log(`\nActive tab is not on LinkedIn (${href}).`);
    console.log('Open https://www.linkedin.com/feed/ in that window and re-run.');
    session.close();
    return;
  }

  const state = await evaluate(session, `(() => ({
    href: location.href,
    hasNav: !!document.querySelector('.global-nav__me, [data-control-name="identity_welcome_message"]'),
    onAuthWall: /\\/(login|checkpoint|authwall|uas)/.test(location.pathname),
  }))()`);

  console.log('');
  if (state.onAuthWall) {
    console.log(`NOT logged in - sitting on ${state.href}`);
    console.log('Log in manually in that Chrome window, then re-run this check.');
  } else if (state.hasNav) {
    console.log('Logged in - LinkedIn nav is present. Browser is ready to drive.');
  } else {
    console.log(`Ambiguous: on ${state.href} but the nav bar was not found.`);
    console.log('Check the window manually; the page may still be loading.');
  }

  session.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
