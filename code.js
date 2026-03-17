// Figma plugin asosiy kodi — batch processing qo'llab-quvvatlanadi

figma.showUI(__html__, { width: 400, height: 400 });

// Batch navbati
let nodeQueue = [];
let queueIndex = 0;

// Navbatdagi keyingi node ni UI ga yuborish
async function sendNextImage() {
  // Navbat tugagan — hammasi qayta ishlandi
  if (queueIndex >= nodeQueue.length) {
    const count = nodeQueue.length;
    nodeQueue = [];
    queueIndex = 0;
    figma.ui.postMessage({ type: "batch-done", count });
    return;
  }

  const node = nodeQueue[queueIndex];

  // Node o'chirilgan bo'lsa — o'tkazib yuborish
  if (!node || node.removed) {
    queueIndex++;
    await sendNextImage();
    return;
  }

  const imageFill = node.fills.find((f) => f.type === "IMAGE" && f.imageHash);
  if (!imageFill) {
    queueIndex++;
    await sendNextImage();
    return;
  }

  try {
    const image = figma.getImageByHash(imageFill.imageHash);
    if (!image) {
      queueIndex++;
      await sendNextImage();
      return;
    }

    // Get image bytes and send to UI
    const bytes = await image.getBytesAsync();
    figma.ui.postMessage({
      type: "image-data",
      bytes,
      nodeId: node.id,
      current: queueIndex + 1,
      total: nodeQueue.length,
    });
  } catch (err) {
    figma.ui.postMessage({
      type: "error",
      message: "Failed to read image: " + (err.message || "Unknown error"),
    });
    nodeQueue = [];
    queueIndex = 0;
  }
}

// Messages from UI
figma.ui.onmessage = async (msg) => {
  // ── open-url: open external link via Figma ──
  if (msg.type === "open-url") {
    figma.openExternal(msg.url);
    return;
  }

  // ── get-image: queue selected nodes and start processing ──
  if (msg.type === "get-image") {
    const selection = figma.currentPage.selection;

    if (selection.length === 0) {
      figma.ui.postMessage({
        type: "error",
        message: "Please select an image first",
      });
      return;
    }

    // Filter nodes that have an IMAGE fill
    const imageNodes = selection.filter(
      (node) =>
        "fills" in node &&
        node.fills &&
        node.fills.some((f) => f.type === "IMAGE" && f.imageHash),
    );

    if (imageNodes.length === 0) {
      figma.ui.postMessage({
        type: "error",
        message: "No image fill found in selection",
      });
      return;
    }

    nodeQueue = imageNodes;
    queueIndex = 0;
    await sendNextImage();
    return;
  }

  // ── apply-result: fonsiz rasmni tegishli node ga qo'llash ──
  if (msg.type === "apply-result") {
    const node = nodeQueue[queueIndex];

    if (!node || node.removed) {
      queueIndex++;
      await sendNextImage();
      return;
    }

    try {
      const newImage = figma.createImage(msg.bytes);
      const oldFill = node.fills.find((f) => f.type === "IMAGE" && f.imageHash);

      // Avvalgi fill larni JSON orqali klonlash (Figma proxy muammosini oldini olish)
      const hiddenFills = JSON.parse(JSON.stringify([...node.fills])).map(
        function (f) {
          return Object.assign({}, f, { visible: false });
        },
      );

      // Yangi fonsiz rasmni ko'rinadigan qilib qo'shish
      node.fills = [
        ...hiddenFills,
        {
          type: "IMAGE",
          imageHash: newImage.hash,
          scaleMode: oldFill ? oldFill.scaleMode : "FILL",
          visible: true,
        },
      ];

      queueIndex++;
      await sendNextImage();
    } catch (err) {
      figma.notify("Error: " + (err.message || "Unknown"), { error: true });
      nodeQueue = [];
      queueIndex = 0;
    }
  }
};
