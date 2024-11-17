document.addEventListener('DOMContentLoaded', function() {
  const addButton = document.getElementById('button-test');
  const startButton = document.getElementById('start-test');
  const resetButton = document.getElementById('reset-test');
  const tabList = document.getElementById('tabList');

  // Function to save the current list to Chrome storage
  function saveList() {
    const items = [];
    tabList.querySelectorAll('li').forEach(item => {
      items.push(item.firstChild.textContent);
    });
    chrome.storage.local.set({ tabList: items });
  }

  // Function to create a list item with a delete button
  function createListItem(url) {
    // Check if the URL already exists in the list
    const existingItems = Array.from(tabList.querySelectorAll('li')).map(item => item.firstChild.textContent);
    if (existingItems.includes(url)) {
      return; // URL already exists, do not add it again
    }

    const listItem = document.createElement('li');
    listItem.textContent = url;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'x';
    deleteButton.style.marginLeft = '10px';
    deleteButton.addEventListener('click', function() {
      tabList.removeChild(listItem);
      saveList();
    });

    listItem.appendChild(deleteButton);
    tabList.appendChild(listItem);
  }

  // Load the saved list from Chrome storage
  chrome.storage.local.get('tabList', function(data) {
    if (data.tabList) {
      data.tabList.forEach(url => {
        createListItem(url);
      });
    }
  });

  // Add a new tab to the list of active tabs in the focus session
  addButton.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const activeTab = tabs[0];
      const url = activeTab.url;

      createListItem(url);
      saveList();
    });
  });

  // Toggle focus session state
  startButton.addEventListener('click', function() {
    chrome.storage.local.get('focusSession', function(data) {
      const focusSession = !data.focusSession; // Toggle the state
      chrome.storage.local.set({ focusSession: focusSession }, function() {
        startButton.textContent = focusSession ? 'End Session' : 'Start Session';
      });
    });
  });

  // Initialize button text based on focus session state
  chrome.storage.local.get('focusSession', function(data) {
    startButton.textContent = data.focusSession ? 'End Session' : 'Start Session';
  });

  // Clear all list items and update Chrome storage
  resetButton.addEventListener('click', function() {
    while (tabList.firstChild) {
      tabList.removeChild(tabList.firstChild);
    }
    chrome.storage.local.set({ tabList: [] });
  });
});