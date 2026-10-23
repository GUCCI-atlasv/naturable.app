(async () => {
  "use strict";
  const S = globalThis.NatShared;
  const $ = (id) => document.getElementById(id);

  // ?tab=<id> lets the screenshot script render the popup for a given tab; normally it's the active tab.
  const forced = Number(new URLSearchParams(location.search).get("tab"));
  const [tab] = forced ? [await chrome.tabs.get(forced)] : await chrome.tabs.query({ active: true, currentWindow: true });
  const pattern = tab && S.originPattern(tab.url || "");
  const host = tab ? S.hostOf(tab.url || "") : "";
  $("version").textContent = S.rulesVersion();

  async function refresh() {
    const { patterns = [] } = await chrome.runtime.sendMessage({ type: "sites" });
    const on = !!pattern && patterns.includes(pattern);

    $("host").textContent = host || "This page";
    $("switch-wrap").hidden = true;
    $("once").hidden = true;
    if (!pattern) {
      $("status").textContent = "Naturable can't run on this page. Use the side panel instead.";
    } else if (S.isSensitiveHost(host)) {
      $("status").textContent = "Stays off on banking, payment and sign-in sites.";
    } else {
      $("switch-wrap").hidden = false;
      $("toggle").checked = on;
      $("status").textContent = on ? "Underlines on. Hover one to see why." : "Off. Turn on to underline as you type.";
      $("once").hidden = on;
    }

    const list = $("sites");
    list.textContent = "";
    for (const p of patterns) {
      const li = document.createElement("li");
      const name = document.createElement("span");
      name.textContent = p.replace(/^https?:\/\//, "").replace(/\/\*$/, "");
      const rm = document.createElement("button");
      rm.className = "link";
      rm.textContent = "Turn off";
      rm.setAttribute("aria-label", "Turn off on " + name.textContent);
      rm.addEventListener("click", async () => { await chrome.runtime.sendMessage({ type: "disable", pattern: p }); refresh(); });
      li.append(name, rm);
      list.appendChild(li);
    }
    $("sites-count").textContent = String(patterns.length);
    $("sites-empty").hidden = patterns.length > 0;

    const { purpose, ignoredKeys } = await S.getSettings();
    $("purpose").value = purpose;
    $("ignored-row").hidden = !ignoredKeys.length;
    $("ignored-count").textContent = `${ignoredKeys.length} ignored ${ignoredKeys.length === 1 ? "phrase" : "phrases"}.`;
  }

  $("toggle").addEventListener("change", async (e) => {
    if (e.target.checked) {
      // Must be called directly from the click. Chrome shows its own "Allow on this site" prompt.
      const granted = await chrome.permissions.request({ origins: [pattern] });
      if (granted) await chrome.runtime.sendMessage({ type: "enable", tabId: tab.id });
    } else {
      await chrome.runtime.sendMessage({ type: "disable", pattern });
    }
    refresh();
  });

  $("once").addEventListener("click", async () => {
    const res = await chrome.runtime.sendMessage({ type: "checkOnce", tabId: tab.id });
    if (res && res.ok) {
      $("status").textContent = "Checking this page until you reload it. Click into a text box.";
      $("once").hidden = true;
    } else {
      $("status").textContent = "Couldn't check this page.";
    }
  });

  $("panel").addEventListener("click", async () => {
    await chrome.sidePanel.open({ windowId: tab.windowId });
    window.close();
  });

  $("purpose").addEventListener("change", (e) => chrome.storage.local.set({ purpose: e.target.value }));
  $("reset").addEventListener("click", async () => { await chrome.storage.local.set({ ignoredKeys: [] }); refresh(); });

  refresh();
})();
