console.log("[SafeNet] Content script loaded.");

const POSITIVE_MESSAGE =
  "Hidden by Safe Net. You deserve a kinder internet today.";

const checkedNodes = new WeakSet();

function shouldCheck(text) {
  if (!text) return false;
  if (text.length < 2) return false;
  if (text.length > 2000) return false;
  return true;
}

function checkToxicity(text) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.error("[SafeNet] Background timed out — model still loading?");
      resolve(null);
    }, 120000);

    chrome.runtime.sendMessage({ type: "CHECK_TOXICITY", text }, (response) => {
      clearTimeout(timeout);
      if (chrome.runtime.lastError) {
        console.error("[SafeNet] Message error:", chrome.runtime.lastError.message);
        resolve(null);
      } else {
        resolve(response);
      }
    });
  });
}

async function processTextNode(node) {
  if (checkedNodes.has(node)) return;
  checkedNodes.add(node);

  const text = node.nodeValue.trim();
  if (!shouldCheck(text)) return;

  const result = await checkToxicity(text);

  if (result?.toxic && result.score > 0.75) {
    console.log("[SafeNet] Hiding toxic content (score:", result.score, "):", text.slice(0, 60));
    node.nodeValue = POSITIVE_MESSAGE;
  } else {
    console.log("[SafeNet] OK (score:", result?.score?.toFixed(3), "):", text.slice(0, 60));
  }
}

function scanNode(root) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT
  );

  let node;
  while ((node = walker.nextNode())) {
    processTextNode(node);
  }
}

scanNode(document.body);

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        scanNode(node);
      }
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});