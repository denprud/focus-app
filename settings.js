document.addEventListener('DOMContentLoaded', function() {
    const themeSelect = document.getElementById('theme-select');
    const actionSelect = document.getElementById('action-select');
    const themeStylesheet = document.getElementById('theme-stylesheet');
    const backButton = document.getElementById('back-button');
  
    // Dictionary to map themes to images
    const themeImages = {
    'style.css': 'img/focus-b&w.png',
    'style2.css': 'img/alert_128.png',
    };


    // Load the saved theme and action from storage
  chrome.storage.local.get(['theme', 'themeImage', 'action'], function(data) {
    if (data.theme) {
      themeStylesheet.href = data.theme;
      themeSelect.value = data.theme;
    }
    if (data.themeImage) {
      chrome.storage.local.set({ themeImage: data.themeImage });
    }
    if (data.action) {
      actionSelect.value = data.action;
    }
  });

    // Change the theme when the user selects a new option
    themeSelect.addEventListener('change', function() {
      const selectedTheme = themeSelect.value;
      const selectedImage = themeImages[selectedTheme];
      themeStylesheet.href = selectedTheme;
      chrome.storage.local.set({ theme: selectedTheme, themeImage: selectedImage }, function() {
        // Reload the page to apply the new theme and image
        window.location.reload();
      });
    });

     // Save the selected action when the user selects a new option
    actionSelect.addEventListener('change', function() {
      const selectedAction = actionSelect.value;
      chrome.storage.local.set({ action: selectedAction });
    });
  
    // Navigate back to the main page
    backButton.addEventListener('click', function() {
      window.location.href = 'index.html'; 
    });
  });

