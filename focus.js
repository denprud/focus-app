
// Start flow of execution once the page is loaded
document.addEventListener('DOMContentLoaded', function() {

  // Variables to record the states of the application
  const addButton = document.getElementById('button-test');
  const startButton = document.getElementById('start-test');
  const resetButton = document.getElementById('reset-test');
  const tabList = document.getElementById('tabList');
  const noTabsMessage = document.getElementById('no-tabs-message');
  const themeStylesheet = document.getElementById('theme-stylesheet');
  const logoImage = document.getElementById('logo-image');
  const link = document.getElementById('focus');

  // Function to save the current tab list to Chrome storage
  function saveList() {
    // Note: O(N) time
    const items = [];
    tabList.querySelectorAll('li').forEach(item => {
      items.push(item.firstChild.textContent);
    });
    chrome.storage.local.set({ tabList: items });
    toggleNoTabsMessage(); // Toggle the 'no tab' message visibility due to change in tabArray
  }

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

  // Function to create a list item with a delete button
  function createListItem(url) {

    //Assures that the url has a proper base
    const baseUrl = getBaseUrl(url);
    if (!baseUrl) return;

    // Check if the base URL already exists in the list
    const existingItems = Array.from(tabList.querySelectorAll('li')).map(item => item.firstChild.textContent);
    if (existingItems.includes(baseUrl)) {
      return; // Base URL already exists, do not add it again
    }

    const listItem = document.createElement('li');
    listItem.textContent = baseUrl;

    // Adds an delete button corresponding to the list item
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'x';
    deleteButton.classList.add('delete-button');
    deleteButton.style.marginLeft = '10px';
    deleteButton.addEventListener('click', function() {
      tabList.removeChild(listItem);
      saveList();
    });

    listItem.appendChild(deleteButton);
    tabList.appendChild(listItem);
    toggleNoTabsMessage(); // Toggle the message visibility
  }

  // Function to toggle the visibility of the no-tabs message
  function toggleNoTabsMessage() {
    if (tabList.children.length === 0) {
      noTabsMessage.style.display = 'block';
    } else {
      noTabsMessage.style.display = 'none';
    }
  }

  // Load the saved list from Chrome storage based on event firing
  chrome.storage.local.get('tabList', function(data) {
    if (data.tabList) {
      data.tabList.forEach(url => {
        createListItem(url);
      });
    }
    toggleNoTabsMessage(); // Toggle the message visibility
  });

  // Update the theme of the webpage if necessary
  chrome.storage.local.get(['theme', 'themeImage'], function(data) {
    if (data.theme) {
      themeStylesheet.href = data.theme;
    }
    if (data.themeImage) {
      logoImage.src = data.themeImage;
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

        chrome.storage.local.get('pomodoroActive', function(data) {
          console.log(data);
          if (data.pomodoroActive){
            chrome.storage.local.set({ pomodoroActive: false });
            // Show a notification when the focus session ends
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'img/alert_128.png',
              title: 'Pomodoro Timer',
              message: 'Pomodoro session ended due to new session!'
            });
          }
        });

        // Set a value in chrome.storage to communicate with pomodoro.js
        chrome.storage.local.set({ resetFocusSession: true });
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
    const focusSession = false;
    chrome.storage.local.set({ tabList: [], focusSession: false });
    startButton.textContent = focusSession ? 'End Session' : 'Start Session';
    toggleNoTabsMessage(); // Toggle the no-tab message visibility


    chrome.storage.local.get('pomodoroActive', function(data) {
      console.log(data);
      if (data.pomodoroActive){
        chrome.storage.local.set({ pomodoroActive: false });
        // Show a notification when the focus session ends
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'img/alert_128.png',
          title: 'Pomodoro Timer',
          message: 'Pomodoro session ended due to new session!'
        });
      }
    });

    // Set a value in chrome.storage to communicate with pomodoro.js
    chrome.storage.local.set({ resetFocusSession: true });
    console.log('Resetting focus session');
  });

  function addLinkStyling(){
    link.classList.add('active');
  }

  addLinkStyling();

  
});