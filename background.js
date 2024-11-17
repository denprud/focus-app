// Function to check if the new tab URL is in the tab list
function checkTabUrl(tabId) {
  chrome.tabs.get(tabId, function(tab) {
    const newTabUrl = tab.url;

    // Retrieve the saved tab list and focus session state from Chrome storage
    chrome.storage.local.get(['tabList', 'focusSession'], function(data) {
      const tabList = data.tabList || [];
      const focusSession = data.focusSession || false;

      // Check if the new tab URL is in the tab list and if the focus session is active
      if (focusSession && !tabList.includes(newTabUrl)) {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: () => {
            document.body.innerHTML = '<h1 style="color: red; text-align: center; margin-top: 20%;">GET BACK TO WORK</h1>';
          }
        });
      }
    });
  });
}

// Listen for tab activation
chrome.tabs.onActivated.addListener(function(activeInfo) {
  checkTabUrl(activeInfo.tabId);
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'loading' || changeInfo.url) {
    checkTabUrl(tabId);
  }
});