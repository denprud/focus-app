let timerInterval;
let timeLeft = 25 * 60; // 25 minutes in seconds
let breakInterval;
let breakTimeLeft = 5 * 60; // 5 minutes in seconds

// Function to start the timer
function startTimer() {
  // Clear any existing interval before starting a new one
  if (!timerInterval) {
    chrome.storage.local.set({ pomodoroActive: true });
    timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        chrome.storage.local.set({ timeLeft: timeLeft });
      } else {
        clearInterval(timerInterval);
        timerInterval = null
        chrome.storage.local.set({ pomodoroActive: false });
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'img/alert_128.png',
          title: 'Pomodoro Timer',
          message: 'Pomodoro session ended! Starting 5-minute break.'
        });
        // timeLeft = 25 * 60; // Reset to 25 minutes
        startBreakTimer(); // Start the break timer
      }
    }, 1000);
  }
}

// Function to start the break timer
function startBreakTimer() {
  // Clear any existing break interval before starting a new one
  if (!breakInterval) {
    chrome.storage.local.set({ focusSession: false, breakTimeStatus: true });
    breakInterval = setInterval(() => {
      if (breakTimeLeft > 0) {
        breakTimeLeft--;
      } else {
        clearInterval(breakInterval);
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'img/alert_128.png',
          title: 'Pomodoro Timer',
          message: 'Break is over! Pomodoro session is officially complete.'
        });
        // Reset break time for the next session
        breakInterval = null;
        breakTimeLeft = 5 * 60;
        timeLeft = 25 * 60
        chrome.storage.local.set({breakTimeStatus: false });
      }
    }, 1000);
  }
}

// Function to stop the timer
function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null; // Clear the interval ID
  breakInterval = null; // Clear the interval ID
  timeLeft = 25 * 60; // Reset to 25 minutes
  chrome.storage.local.set({ pomodoroActive: false, timeLeft: timeLeft, breakTimeStatus: false });
}

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startTimer') {
    startTimer();
    sendResponse({ status: 'started' });
  } else if (request.action === 'stopTimer') {
    stopTimer();
    sendResponse({ status: 'stopped' });
  } else if (request.action === 'getTimeLeft') {
    sendResponse({ timeLeft: timeLeft });
  } else if (request.action === 'resetFocusSession') {
    stopTimer();
    sendResponse({ status: 'resetted' });
  } else if (request.action === 'getBreakTime') {
    sendResponse({ breakTimeLeft: breakTimeLeft });
  }
});

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

    // Retrieve the saved tab list, focus session state, and action from Chrome storage
    chrome.storage.local.get(['tabList', 'focusSession', 'action', 'pomodoroActive', "listSetting"], function(data) {
      const tabList = data.tabList || [];
      const focusSession = data.focusSession || false;
      const pomodoroActive = data.pomodoroActive || false;
      const action = data.action || 'change-dom';
      const listSetting = data.listSetting || 'allow-list';

      // Check if the new tab base URL is in the tab list and if the focus session or Pomodoro timer is active
      if ((focusSession || pomodoroActive) && ((listSetting === 'allow-list' && !tabList.includes(newTabBaseUrl)) || (listSetting === 'blocked-list' && tabList.includes(newTabBaseUrl)))) {
        if (action === 'change-dom') {
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
              document.body.innerHTML = '<h1 style="color: red; text-align: center; margin-top: 20%;">GET BACK TO WORK</h1>';
            }
          });
        } else if (action === 'show-alert') {
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
              alert('GET BACK TO WORK');
            }
          });
        }
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