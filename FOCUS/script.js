//script.js
//Javascript script that interacts with the DOM of the extenstion

let tabView = document.getElementById('tabList');
let savedTabArray = []
let currentTabTitle = "None"
let urlStemArray = []

chrome.storage.local.get(['savedTabArray','urlStemArray', "testURL"], function(result) {
    //If there is something in chrome storage, run this
    if (result.savedTabArray) {
        savedTabArray =  result.savedTabArray
        urlStemArray =  result.urlStemArray
        console.log("testURL: ", result.testURL)

        console.log(savedTabArray)
        console.log(urlStemArray)
        addDOMTabs(savedTabArray, urlStemArray)
        
        
        // Select all the cancel buttons
        var cancelButtons = document.querySelectorAll(".cancelButton");

        // Add a click event listener to each cancel button
        cancelButtons.forEach(function(button) {
            button.addEventListener("click", function() {
              
              // Select the parent 'tabView' div of the clicked cancel button
              var parentTab = this.parentNode;
              // Remove the 'tabView' div
              tabView.removeChild(parentTab.parentNode);
              
              
              //console.log(savedTabArray.indexOf(parseInt(button.parentNode.parentNode.id)))
              //Delete elements from both arrays
              urlStemArray.splice(urlStemArray[savedTabArray.indexOf(parseInt(button.parentNode.parentNode.id))], 1)
              savedTabArray.splice(savedTabArray.indexOf(parseInt(button.parentNode.parentNode.id)), 1)
              
              removeTabFromGroup([parseInt(button.parentNode.parentNode.id)])

              console.log(savedTabArray)
              console.log(urlStemArray)
              //Set local storages
              chrome.storage.local.set({tabViewContent: tabView.innerHTML});
              chrome.storage.local.set({savedTabArray: savedTabArray});
              chrome.storage.local.set({urlStemArray: urlStemArray});
              chrome.runtime.sendMessage({urlStemArray: urlStemArray, savedTabArray: savedTabArray});
              if(savedTabArray.length == 0){
                console.log("test")
                chrome.runtime.sendMessage({focusActivated: false});
              }
            });
        });
      }
      if(result.savedTabArray){
        savedTabArray = result.savedTabArray
      }
});

//Adds a selected tab to the tabs array
document.getElementById('button-test').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if(!savedTabArray.includes(tabs[0].id)){
        
        savedTabArray.push(tabs[0].id)
        chrome.storage.local.set({savedTabArray: savedTabArray});
        
        
        createTabGroup(savedTabArray, "Active Tabs", "blue")
        
        //chrome.tabGroups.update(groupId, { collapsed: false, title: title, color: color });

        
        currentTabTitle = tabs[0].url.split('/')[2]
        urlStemArray.push(currentTabTitle)
        console.log(savedTabArray)
        console.log(urlStemArray)
        
        chrome.storage.local.set({urlStemArray: urlStemArray});
        
        //Add new tabs
        var newTab = document.createElement("li");
        newTab.id = String(tabs[0].id)
        var innerTab = document.createElement("div")
        innerTab.className = "listDiv"
        // Create the paragraph
        var p = document.createElement("p");
        p.innerHTML = currentTabTitle;

        // Create the button
        var button = document.createElement("button");
        button.className = "cancelButton";
        button.innerHTML = "x";
        //Fix the DOM elements
        innerTab.appendChild(p)
        innerTab.appendChild(button)
        newTab.appendChild(innerTab)
        tabView.appendChild(newTab)
        chrome.storage.local.set({tabViewContent: tabView.innerHTML});
        //addDOMTabs([tabs[0].id],[currentTabTitle])

        //Delete the list item when clicked
        button.addEventListener("click", function() {
          console.log("deleting tab")
          // Select the parent 'tabView' div of the clicked cancel button
          var parentTab = this.parentNode;
          // Remove the 'tabView' div
          tabView.removeChild(parentTab.parentNode);
          

          //Delete the elements from both arrays
          urlStemArray.splice(urlStemArray[savedTabArray.indexOf(parseInt(button.parentNode.parentNode.id))], 1)
          savedTabArray.splice(savedTabArray.indexOf(parseInt(button.parentNode.parentNode.id)), 1)
          
          removeTabFromGroup([parseInt(button.parentNode.parentNode.id)])

          chrome.storage.local.set({tabViewContent: tabView.innerHTML});
          chrome.storage.local.set({savedTabArray: savedTabArray});
          chrome.storage.local.set({urlStemArray: urlStemArray});

         
          //Send message to the background
          console.log(savedTabArray)
          console.log(!savedTabArray)
          chrome.runtime.sendMessage({urlStemArray: urlStemArray, savedTabArray: savedTabArray});
          if(savedTabArray.length == 0){
            console.log("test")
            chrome.runtime.sendMessage({focusActivated: false});
          }
        });

        //Send message to the background
        chrome.runtime.sendMessage({focusActivated: true, urlStemArray: urlStemArray, savedTabArray: savedTabArray});
        
      }
  });
});


//Resets the activated tab when pressing the reset button
document.getElementById('reset-test').addEventListener('click', function() {
    removeTabFromGroup(savedTabArray)
    savedTabArray = []
    urlStemArray = []
    //groupId = null
    chrome.runtime.sendMessage({focusActivated: false, urlStemArray: urlStemArray, savedTabArray: savedTabArray});
    tabView.innerHTML = ""

    chrome.storage.local.remove('savedTabArray', function() {
      console.log('savedTabTitle has been removed from local storage');
    });
    chrome.storage.local.remove('urlStemArray', function() {
      console.log('urlStemArray has been removed from local storage');
    }); 
    
});

  async function createTabGroup(tabIds, title, color) {
    // Create a new tab group with the specified tabs
    var groupId = await chrome.tabs.group({ tabIds: tabIds }, (groupId)=>{
      chrome.tabGroups.update(groupId, { collapsed: false, title: title, color: color });
    });

    console.log(groupId)
    // Update the tab group with the specified title and color
    
  }

  async function removeTabFromGroup(tabIds) {
    // Create a new tab group with the specified tabs
    var groupId = await chrome.tabs.ungroup(tabIds);

    console.log(groupId)
    // Update the tab group with the specified title and color
    
  }

  chrome.tabs.onRemoved.addListener((tabId)=>{
    if(savedTabArray.includes(tabId)){
      
      chrome.storage.local.set({testURL: urlStemArray[savedTabArray.indexOf(tabId)]});

      urlStemArray.splice(savedTabArray.indexOf(tabId), 1)
      savedTabArray.splice(savedTabArray.indexOf(tabId), 1);
      tabView.removeChild(document.getElementById(String(tabId)));

    
      chrome.storage.local.set({savedTabArray: savedTabArray});
      chrome.storage.local.set({urlStemArray: urlStemArray});

      if(savedTabArray.length == 0){
        console.log("test")
        chrome.runtime.sendMessage({focusActivated: false});
      }
    }
  })

   function addDOMTabs(savedTabArray, urlStemArray){
    console.log("lol")
    for (let i = 0; i < savedTabArray.length; i++ ){
      //Add new tabs
      let newTab = document.createElement("li");
      newTab.id = String(savedTabArray[i])
      let innerTab = document.createElement("div")
      innerTab.className = "listDiv"
      // Create the paragraph
      let p = document.createElement("p");
      p.innerHTML = urlStemArray[i];

      // Create the button
      let button = document.createElement("button");
      button.className = "cancelButton";
      button.innerHTML = "x";
      //Fix the DOM elements
      innerTab.appendChild(p)
      innerTab.appendChild(button)
      newTab.appendChild(innerTab)
      tabView.appendChild(newTab)
    }
  }

 