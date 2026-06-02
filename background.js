const OFFSCREEN_DOCUMENT_PATH = "offscreen.html";

async function hasOffscreenDocument() {
  if (chrome.offscreen.hasDocument) {
    return await chrome.offscreen.hasDocument();
  }

  const contexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)]
  });

  return contexts.length > 0;
}

async function setupOffscreenDocument() {
  if (await hasOffscreenDocument()) return;

  await chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT_PATH,
    reasons: ["WORKERS"],
    justification: "Run the local toxicity model outside the service worker."
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "CHECK_TOXICITY") return;

  console.log("[SafeNet] Checking:", message.text.slice(0, 80));

  (async () => {
    try {
      await setupOffscreenDocument();

      const response = await chrome.runtime.sendMessage({
        target: "offscreen",
        type: "CHECK_TOXICITY",
        text: message.text
      });

      console.log("[SafeNet] Result:", response);
      sendResponse(response);
    } catch (err) {
      console.error("[SafeNet] Classification error:", err);
      sendResponse({
        toxic: false,
        error: String(err)
      });
    }
  })();

  return true;
});