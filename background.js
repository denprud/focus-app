// Function to get the base URL (origin) of a given URL
function getBaseUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.origin;
  } catch (e) {
    console.error('Invalid URL:', url);
    return null;
  }
}

// Function to check if the new tab URL is in the tab list
function checkTabUrl(tabId) {
  chrome.tabs.get(tabId, function(tab) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }

    const newTabUrl = tab.url;
    const newTabBaseUrl = getBaseUrl(newTabUrl);

    // Retrieve the saved tab list and focus session state from Chrome storage
    chrome.storage.local.get(['tabList', 'focusSession'], function(data) {
      const tabList = data.tabList || [];
      const focusSession = data.focusSession || false;

      // Check if the new tab base URL is in the tab list and if the focus session is active
      if (focusSession && !tabList.includes(newTabBaseUrl)) {
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

// Listen for tab activation (triggers when user moves to new tab)
chrome.tabs.onActivated.addListener(function(activeInfo) {
  checkTabUrl(activeInfo.tabId);
});

// Listen for tab updates (triggers when user refreshes or change current tab)
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'loading' || changeInfo.url) {
    checkTabUrl(tabId);
  }
});