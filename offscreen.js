import { env, pipeline } from "@huggingface/transformers";

env.backends.onnx.wasm.numThreads = 1;
env.backends.onnx.wasm.wasmPaths = {
  wasm: chrome.runtime.getURL("dist/assets/ort-wasm-simd-threaded.asyncify.wasm")
};

let classifierPromise = null;

function getClassifier() {
  if (!classifierPromise) {
    console.log("[SafeNet] Loading classifier model...");
    classifierPromise = pipeline(
      "text-classification",
      "Xenova/toxic-bert",
      {
        progress_callback: (progress) => {
          console.log("[SafeNet] Model progress:", progress);
        }
      }
    );

    classifierPromise
      .then(() => console.log("[SafeNet] Classifier model ready."))
      .catch((err) => {
        console.error("[SafeNet] Classifier failed to load:", err);
        classifierPromise = null;
      });
  }

  return classifierPromise;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target !== "offscreen" || message.type !== "CHECK_TOXICITY") {
    return;
  }

  (async () => {
    try {
      const classifier = await getClassifier();
      const result = await classifier(message.text);

      sendResponse({
        toxic: result?.[0]?.label?.toLowerCase().includes("toxic"),
        score: result?.[0]?.score ?? 0,
        raw: result
      });
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
