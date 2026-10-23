/* Service worker: per-site content-script registration, context menu, badge. Never sees page text except a
   selection the user sends with "Check with Naturable", which goes to the side panel via session storage. */
importScripts("shared/common.js");

const S = self.NatShared;
const SCRIPT_ID = "naturable-inline";
const CS_FILES = ["vendor/naturable.iife.js", "shared/docs-words.js", "shared/common.js", "content/content.js"];
const MENU_ID = "naturable-check-selection";

/** Sites the user turned on = host permissions they granted (minus any sensitive host). */
async function enabledPatterns() {
  const { origins = [] } = await chrome.permissions.getAll();
  return origins.filter((p) => {
    const host = p.replace(/^https?:\/\//, "").replace(/\/\*$/, "");
    return !host.includes("*") && !S.isSensitiveHost(host);
  });
}

/** Keep one dynamic content script whose matches are exactly the enabled sites. Calls are serialized:
    install, startup and permission events can overlap, and a second register would throw "Duplicate script ID". */
let syncing = Promise.resolve();
function syncRegistration() {
  const run = syncing.then(syncRegistrationNow, syncRegistrationNow);
  syncing = run.catch(() => {});
  return run;
}

async function syncRegistrationNow() {
  const matches = await enabledPatterns();
  const existing = await chrome.scripting.getRegisteredContentScripts({ ids: [SCRIPT_ID] });
  if (!matches.length) {
    if (existing.length) await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] });
    return [];
  }
  const def = { id: SCRIPT_ID, matches, js: CS_FILES, runAt: "document_idle", allFrames: true, persistAcrossSessions: true };
  if (existing.length) await chrome.scripting.updateContentScripts([def]);
  else await chrome.scripting.registerContentScripts([def]);
  return matches;
}

async function injectInto(tabId) {
  await chrome.scripting.executeScript({ target: { tabId, allFrames: true }, files: CS_FILES });
}

async function tellTabs(pattern, message) {
  const tabs = await chrome.tabs.query(pattern ? { url: pattern } : {});
  for (const t of tabs) chrome.tabs.sendMessage(t.id, message).catch(() => {});
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: MENU_ID, title: "Check with Naturable", contexts: ["selection"] });
  chrome.action.setBadgeBackgroundColor({ color: "#A2462A" });
  syncRegistration();
});
chrome.runtime.onStartup.addListener(syncRegistration);

// Site access can also be granted or revoked from Chrome's own extension menu.
// The popup may close while Chrome shows the permission prompt, so start checking open tabs from here.
chrome.permissions.onAdded.addListener(async ({ origins = [] }) => {
  const enabled = await syncRegistration();
  for (const p of origins.filter((o) => enabled.includes(o))) {
    for (const t of await chrome.tabs.query({ url: p })) injectInto(t.id).catch(() => {});
  }
});
chrome.permissions.onRemoved.addListener(async ({ origins = [] }) => {
  await syncRegistration();
  for (const p of origins) tellTabs(p, { type: "naturable:off" });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ID) return;
  // sidePanel.open must run inside the click's user gesture, before any await.
  const opening = tab && tab.id >= 0 ? chrome.sidePanel.open({ tabId: tab.id }) : chrome.sidePanel.open({ windowId: tab.windowId });
  opening.catch(() => {});
  chrome.storage.session.set({ pending: { text: info.selectionText || "", ts: Date.now() } });
});

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  (async () => {
    switch (msg && msg.type) {
      case "enable": {
        // The popup has already obtained the permission (it needs the user's click).
        await syncRegistration();
        if (msg.tabId != null) await injectInto(msg.tabId).catch(() => {});
        return { ok: true };
      }
      case "disable": {
        await chrome.permissions.remove({ origins: [msg.pattern] });
        await syncRegistration();
        tellTabs(msg.pattern, { type: "naturable:off" });
        return { ok: true };
      }
      case "checkOnce": {
        // activeTab: the popup was just opened on this tab, so we may inject without host permission.
        await injectInto(msg.tabId);
        return { ok: true };
      }
      case "badge": {
        // Count for the text box being edited (whichever frame it is in).
        if (sender.tab && sender.tab.id >= 0) {
          chrome.action.setBadgeText({ tabId: sender.tab.id, text: msg.count > 0 ? String(Math.min(msg.count, 99)) : "" });
        }
        return { ok: true };
      }
      case "sites":
        return { patterns: await enabledPatterns() };
      default:
        return { ok: false };
    }
  })().then(reply, (e) => reply({ ok: false, error: String(e && e.message || e) }));
  return true;
});
