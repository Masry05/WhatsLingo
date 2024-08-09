(function() {

let isEnabled = false;
let submitted = false;
let password = "";
let firstPress = false;
let ignore = false;

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
});

async function decryptAllMessages() { 
    setTimeout(async () => {
        const messageElements = document.querySelectorAll('._akbu')
        let texts = []   
        let indices = []
        for(let i = messageElements.length - 1; i >= 0; i-- ){
            const mainTextElement = messageElements[i].querySelector('._ao3e');
            let text = mainTextElement.textContent;
            if(text.includes("ovniuBkIqd8t_")){
                texts.push(text);
                indices.push(i);
            }      
        }
        decryptList(messageElements,texts,indices);
    }, 500);
}

async function encryptBackMessages() {  
    setTimeout(async () => {
        const messageElements = document.querySelectorAll('._akbu');
        let texts = []   
        let indices = []
        for(let i = messageElements.length - 1; i >= 0; i-- ){
            const mainTextElement = messageElements[i].querySelector('._ao3e');
            let text = mainTextElement.textContent;
            if(text.substring(text.length - 2) === "🔒"){
                text = text.substring(0, text.length - 3);
                texts.push(text);
                indices.push(i);
            }     
        }
        encryptList(messageElements,texts,indices)

    }, 500);
}

function observeClassChanges() {
    let chatBox = document.querySelector("._ajyl");
    const observer = new MutationObserver((mutations) => {
        if(isEnabled && mutations.length >= 3){
            
            if(mutations.length > 10 && !firstPress){
                document.querySelector(".x1y332i5").click();
                firstPress = true;
            }
            else if(mutations.length < 10 && !ignore){
                let list = document.querySelectorAll('._akbu');
                let lastMessage = list[list.length-1];
                decrypt(lastMessage.querySelector('._ao3e'))
                ignore = true;
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
            if(text.substring(text.length - 2) === "🔒") {
                text = text.substring(0, text.length - 3);
                const data = { text, password };
                fetch('http://127.0.0.1:5000/encrypt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(data => {
                    element.textContent = data;
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            }
        } else {
            text = element.innerText;
            const data = { text, password };
            fetch('http://127.0.0.1:5000/encrypt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                navigator.clipboard.writeText(data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    }
}

function encryptList(chats,text,indices){
    
    const data = { text, password };

    fetch('http://127.0.0.1:5000/encryptList', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        for(let i = text.length-1; i >=0; i--)      
            chats[indices[i]].querySelector('._ao3e').textContent = data[i];    
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function decrypt(element) {
    if(element != null){
        let text = element.textContent;
        const data = { text, password };
    
        fetch('http://127.0.0.1:5000/decrypt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data !== "Wrong Password")
                element.textContent = data;
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

function decryptList(chats,text,indices){
    
    const data = { text, password };

    fetch('http://127.0.0.1:5000/decryptList', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        for(let i = text.length-1; i >=0; i--)      
            if (data[i] !== "Wrong Password") 
                chats[indices[i]].querySelector('._ao3e').textContent = data[i];    
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

})();
