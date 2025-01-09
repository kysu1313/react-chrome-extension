
console.log("Background script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    console.log("Background script loaded2");
    if (request.action === "populateSearchBoxes") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          // Check if content script is available before sending the message
          chrome.tabs.sendMessage(tabs[0].id, request, (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error sending message to content script:", chrome.runtime.lastError.message);
              sendResponse({ status: "error", message: chrome.runtime.lastError.message });
            } else {
              sendResponse(response);
            }
          });
        } else {
          console.error("No active tab found.");
          sendResponse({ status: "error", message: "No active tab found." });
        }
      });
      return true; // To indicate that sendResponse is asynchronous
    }
  });