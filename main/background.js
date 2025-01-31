// Message handling with proper error handling and response
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        if (!message || typeof message !== 'object') {
            throw new Error('Invalid message format');
        }

        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (!tabs || !tabs[0] || !tabs[0].id) {
                sendResponse({ error: 'No active tab found' });
                return;
            }
            // Send message to content script
            chrome.tabs.sendMessage(tabs[0].id, message)
                .then(response => {
                    console.log('Message sent successfully:', response);
                    sendResponse({ success: true, data: response });
                })
                .catch(error => {
                    console.error('Message sending failed:', error);
                    sendResponse({ error: error.message });
                });
        });
    } catch (error) {
        console.error('Error in message handler:', error);
        sendResponse({ error: error.message });
    }
    return true; // Keep the message channel open for async response
});

// Content script injection with improved error handling
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes("web.whatsapp.com")) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        })
        .catch((error) => {
            console.error('Failed to inject content script:', error);
        });
    }
});
