//Background script 

let lastActivatedStatus = false
let activatedStatus = false
let urlStemArray = []
let savedTabArray = []

chrome.runtime.onStartup.addListener(createOffscreen);
self.onmessage = e => {}; // keepAlive
createOffscreen();

//Gets the selected tab information when sent from script.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // savedTabId = request.savedTabId;
  
  activatedStatus = request.focusActivated
  urlStemArray = request.urlStemArray
  savedTabArray = request.savedTabArray

});


//Listener that detects that the tab changes when the tab switches
chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.action.enable(activeInfo.tabId, ()=>{
    console.log("Action")
  })
  if (activatedStatus !== false && (!savedTabArray.includes(activeInfo.tabId))) {
    // chrome.tabs.sendMessage(activeInfo.tabId, {message: "change_dom"});
    chrome.scripting.executeScript({
      target: {tabId: activeInfo.tabId},
      func: changeDOM
    });
  }
});

//Listener that detects that the user opens a new tab thats not valid
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  chrome.action.enable()
  if (changeInfo.status === 'complete' && activatedStatus !== false && (!savedTabArray.includes(tabId))) {
    // chrome.tabs.sendMessage(tabId, {message: "change_dom"});
    chrome.scripting.executeScript({
      target: {tabId: tabId},
      func: changeDOM
    });
  }
});

//Listener that detects that active tab diverges to a completely new url
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  chrome.action.enable()
  if (changeInfo.status === 'complete' && activatedStatus !== false && savedTabArray.includes(tabId) && (!urlStemArray.includes(tab.url.split("/")[2]))) {
    // chrome.tabs.sendMessage(tabId, {message: "change_dom"});
    chrome.scripting.executeScript({
      target: {tabId: tabId},
      func: critiqueAndChangeDOM
    });
  }
});

chrome.tabs.onRemoved.addListener((tabId)=>{
  if(savedTabArray.includes(tabId)){
    urlStemArray.splice(savedTabArray.indexOf(tabId), 1);
    savedTabArray.splice(savedTabArray.indexOf(tabId), 1);
   
    chrome.storage.local.set({savedTabArray: savedTabArray});
    chrome.storage.local.set({urlStemArray: urlStemArray});

    if(savedTabArray.length == 0){
      console.log("test")
      activatedStatus = false
    }
  }
})

async function createOffscreen() {
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['BLOBS'],
    justification: 'keep service worker running',
  }).catch(() => {});
}

//Scripting Functions
function changeDOM() {
  document.body.innerHTML = "<h1>GET BACK TO WORK</h1>";
}

function critiqueAndChangeDOM() {
  document.body.innerHTML = "<h1>DON'T YOU EVEN TRY IT</h1>";
}

