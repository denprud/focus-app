document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('start-timer');
    const stopButton = document.getElementById('stop-timer');
    const timestamp = document.getElementById('timestamp');
    const breakTimestamp = document.getElementById('break-timestamp'); // Add an element for the break timer
    const themeStylesheet = document.getElementById('theme-stylesheet');
    const breakSign = document.getElementById('break-sign');
    const link = document.getElementById('pomodoro');
    let updateInterval;
    let breakUpdateInterval;

    function updateTimestamp(timeLeft) {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timestamp.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      timestamp.style.display = 'block'; // Show the Pomodoro timer
      breakTimestamp.style.display = 'none'; // Hide the break timer
    }

    function updateBreakTimestamp(breakTimeLeft) {
      const minutes = Math.floor(breakTimeLeft / 60);
      const seconds = breakTimeLeft % 60;
      breakTimestamp.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      breakTimestamp.style.display = 'block'; // Show the break timer
      timestamp.style.display = 'none'; // Hide the Pomodoro timer
    }

    function getTimeLeft() {
      chrome.runtime.sendMessage({ action: 'getTimeLeft' }, function(response) {
        updateTimestamp(response.timeLeft);
      });
    }

    function getBreakTimeLeft() {
      chrome.runtime.sendMessage({ action: 'getBreakTime' }, function(response) {
        updateBreakTimestamp(response.breakTimeLeft);
      });
    }

    function startUpdatingTimestamp() {
      if (updateInterval) {
        clearInterval(updateInterval);
      }
      updateInterval = setInterval(getTimeLeft, 1000);
    }

    function startUpdatingBreakTimestamp() {
      if (breakUpdateInterval) {
        clearInterval(breakUpdateInterval);
      }
      breakUpdateInterval = setInterval(getBreakTimeLeft, 1000);
    }

    startButton.addEventListener('click', function() {
      chrome.runtime.sendMessage({ action: 'startTimer' }, function(response) {
        if (response.status === 'started') {
          getTimeLeft();
          startUpdatingTimestamp();
        }
      });
    });

    stopButton.addEventListener('click', function() {
      chrome.runtime.sendMessage({ action: 'stopTimer' }, function(response) {
        if (response.status === 'stopped') {
          clearInterval(updateInterval);
          updateTimestamp(25 * 60); // Reset to 25 minutes
        }
      });
    });

    // Initialize the timestamp and start updating it if the timer is running
    chrome.runtime.sendMessage({ action: 'getTimeLeft' }, function(response) {
      updateTimestamp(response.timeLeft);
      chrome.storage.local.get('pomodoroActive', function(data) {
        if (data.pomodoroActive) {
          startUpdatingTimestamp();
        }
      });
    });

    // Initialize button text based on focus session state
    chrome.storage.local.get('resetFocusSession', function(data) {
      if (data.resetFocusSession) {
        console.log('Resetting focus session');
        chrome.runtime.sendMessage({ action: 'stopTimer' }, function(response) {
          if (response && response.status === 'stopped') {
            clearInterval(updateInterval);
            updateTimestamp(25 * 60);
          }
        });

        // Reset the value in chrome.storage
        chrome.storage.local.set({ resetFocusSession: false });
      }
    });

    // Initialize the timestamp and start updating it if the timer is running
    chrome.runtime.sendMessage({ action: 'getBreakTime' }, function(response) {
        // updateTimestamp(response.timeLeft);
        chrome.storage.local.get('breakTimeStatus', function(data) {
          if (data.breakTimeStatus) {
            updateBreakTimestamp(response.breakTimeLeft);
            startUpdatingBreakTimestamp();
          }
        //   else {
        //     breakTimestamp.style.display = 'none'; // Hide the break timer initially
        //     timestamp.style.display = 'block'; // Show the Pomodoro timer
        //   }
        });
    });

    // Listen for changes in chrome.storage
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        if (changes.breakTimeStatus && changes.breakTimeStatus.newValue) {
            // Clear existing update interval
            if (updateInterval) {
                clearInterval(updateInterval);
            }

           

            console.log('Break time started');
            getBreakTimeLeft();
            startUpdatingBreakTimestamp();

            breakSign.style.display = changes.breakTimeStatus.newValue ? 'block' : 'none';
        }
        else if (changes.breakTimeStatus && !changes.breakTimeStatus.newValue) {
            // Clear existing break interval
            if (breakUpdateInterval) {
                clearInterval(breakUpdateInterval);
            }

            console.log("break over");
            breakTimestamp.style.display = 'none'; // Hide the break timer initially
            timestamp.style.display = 'block'; // Show the Pomodoro timer 
            // updateTimestamp(1 * 10); // Reset to 25 minutes

            

            // Ensure the timer starts updating again
            startUpdatingTimestamp();

            breakSign.style.display = changes.breakTimeStatus.newValue ? 'block' : 'none';
        }
    });

    // Update the theme of the webpage if necessary
    chrome.storage.local.get(['theme', 'themeImage'], function(data) {
      if (data.theme) {
        themeStylesheet.href = data.theme;
      }
    });

    chrome.storage.local.get('breakTimeStatus', function(data) {
             breakSign.style.display = data.breakTimeStatus ? 'block' : 'none';
    });

    function addLinkStyling(){
      link.classList.add('active');
    }

    addLinkStyling();
});