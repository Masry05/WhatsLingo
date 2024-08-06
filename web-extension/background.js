chrome.runtime.onMessage.addListener(data => {
    console.log(data);
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {password: data['password'], submitted: data['submitted'], status: data['status']});
    });
    chrome.storage.local.set(data);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url.includes("web.whatsapp.com")) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }).catch((error) => console.error(error));
    }
});
