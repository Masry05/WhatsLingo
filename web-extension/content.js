(function() {

let isEnabled = false;
let submitted = false;
let password = "";
let firstPress = false;
let ignore = false;
let messageCounts = -1;
let scrollCounter = 0;

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch(message['status']) {
        
        case "Enabled":
            isEnabled = true;
            decryptAllMessages();           
            break;

        case "Disabled":
            isEnabled = false;
            encryptBackMessages();
            break;

    }
    password  = message['password'];
    submitted = message['submitted'] === "Yes" ? true : false;
    isEnabled = message['status'] === "Enabled" ? true : false;
});

document.addEventListener("keydown", (event) => {
    try {
        let element = document.querySelector("._ak1l").querySelector(".x15bjb6t").querySelector(".selectable-text")
        if(event.key === 'F2' && element !== null && isEnabled) {
            const eventOptions = { 
                bubbles: true, 
                cancelable: true, 
                view: window, 
                ctrlKey: true, 
                key: 'a', 
                code: 'KeyA', 
                keyCode: 65 
            };
            element.focus();

            const keydownEvent = new KeyboardEvent('keydown', eventOptions);
            element.dispatchEvent(keydownEvent);
        
            // Create and dispatch a keyup event
            const keyupEvent = new KeyboardEvent('keyup', eventOptions);
            element.dispatchEvent(keyupEvent);
            encrypt(element, false);    
        }
    } catch (Exception) {
        console.log(Exception);
    }
});

document.querySelector(".x1y332i5").addEventListener("click", () => { // Contacts ID
    observeClassChanges();
    chrome.storage.local.get(['password', 'submitted', 'status'], function(result) {
        password = result['password'];
        submitted = result['submitted'] === "Yes" ? true : false;
        isEnabled = result['status'] === "Enabled" ? true : false;
    });
    if(submitted){
        if(isEnabled)
            decryptAllMessages()
        else
            encryptBackMessages()
    }
    document.querySelector("._ajyl").addEventListener('scroll', ()=>{
        scrollCounter++;
        if(scrollCounter === 220){
            decryptAllMessages();
            scrollCounter = 0;
        }
            
    });
});

async function decryptAllMessages() { 
    setTimeout(async () => {
        const messageElements = document.querySelectorAll('._akbu:not(._akbw)');
        messageCounts = messageElements.length;
        if(isEnabled)
            decryptList(messageElements);
    }, 500);
}

async function encryptBackMessages() {  
    setTimeout(async () => {
        const messageElements = document.querySelectorAll('._akbu:not(._akbw)');
        messageCounts = messageElements.length;
        encryptList(messageElements)

    }, 500);
}

function observeClassChanges() {
    let chatBox = document.querySelector("._ajyl");
    const observer = new MutationObserver((mutations) => {
        if(isEnabled && mutations.length >= 2){
            if(mutations.length > 10 && !firstPress){
                document.querySelector(".x1y332i5").click();
                firstPress = true;
            }
            else if(mutations.length < 10 && !ignore){
                let list = document.querySelectorAll('._akbu:not(._akbw)');
                if(messageCounts != -1 && messageCounts != list.length){
                    let lastMessage = list[list.length-1];
                    decrypt(lastMessage.querySelector('._ao3e'))
                    ignore = true;
                } 
            }
            else if(ignore)
                ignore = false;
        }  
    });
    observer.observe(chatBox, {
        attributes: false,
        childList: true,
        subtree: true
    });
}

function encrypt(element, isChats) {
    if(element != null){
        let text = "";
        if(isChats) {
            text = element.textContent;
            text = text.substring(0, text.length - 4);
            const ciphertext = CryptoJS.AES.encrypt(text, password).toString();
            element.textContent = ciphertext;
        } 
        else {
            text = element.innerText;
            const ciphertext = CryptoJS.AES.encrypt(text, password).toString();
            navigator.clipboard.writeText(ciphertext);
        }
    }
}

function encryptList(chats){
    
    for(let i = chats.length-1; i >=0; i--){
        let element = chats[i].querySelector('._ao3e')
        let text = element.textContent;
        if(text.substring(text.length - 2) === "🔒")
            encrypt(element,true);
    }
}

function decrypt(element) {
    if(element != null){
        try{
            let text = element.textContent;
            const bytes = CryptoJS.AES.decrypt(text, password);
            const originalText = bytes.toString(CryptoJS.enc.Utf8);
            if (originalText.length !== 0)
                element.textContent = originalText + "  🔒";
        }
        catch{

        }
    }
}

function decryptList(chats){
    for(let i = chats.length-1; i >=0; i--)
        if(chats[i].querySelector('._ao3e').textContent.includes("U2FsdGV"))
            decrypt(chats[i].querySelector('._ao3e'));
}

})();
