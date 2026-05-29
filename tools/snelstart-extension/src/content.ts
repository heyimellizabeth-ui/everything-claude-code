// Relay upload endpoint info from page context to the sidebar.
// The sidebar sends a PING; this script responds with any SnelStart
// upload form action URL it finds on the current page.

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== "SNELSTART_PING") return;

  const form = document.querySelector<HTMLFormElement>(
    'form[action*="upload"], form[action*="factuur"], form[action*="bon"]'
  );

  sendResponse({
    uploadUrl: form?.action ?? null,
    pageTitle: document.title,
  });
});
