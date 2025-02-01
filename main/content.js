import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the AI
const apiKey = process.env.GOOGLE_API_KEY;
let model;
if (!apiKey) {
    console.error("API key not found!");
} else {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        console.log("AI initialized successfully");
    } catch (error) {
        console.error("Error initializing AI:", error);
    }
}

(function() {

    let senderLanguage = '';
    let senderDialect = '';
    let senderGender = '';
    let receiverLanguage = '';
    let receiverDialect = '';
    let receiverGender = '';
    let isFormal = false;
    let isEnabled = false;
    let isFranco = false;
    let status = false; // True if translation is in progress
    let currentLanguage = '';
    let currentDialect = '';
    let chats = []; // Changed from Set to Array
    let chatObserver = null;
    let classObserver = null;  // New observer for class changes
    let originalChats = [];
    let seenMessage = '';

    

    // Function to initialize or update the chat observer
    function initializeChatObserver() {
        // Get the chat container and observe for new messages
        const chatContainer = document.querySelector('div[role="application"]');
        if (!chatContainer) {
            console.log('Chat container not found, will retry...');
            return;
        }

        let batchTimeout = null;
        let newMessagesInBatch = false;

        // Create observer for new messages
        chatObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Check if it's an element node
                        const messages = node.classList?.contains('_akbu') ? 
                            [node] : 
                            Array.from(node.getElementsByClassName('_akbu'));
                        
                        messages.forEach(msg => {
                            // Only add if not already in the array
                            if (!chats.includes(msg)) {
                                chats.push(msg);
                                newMessagesInBatch = true;
                                console.log('New message added to cache');      
                            }
                        });
                    }
                });
            });

            // Clear existing timeout if any
            if (batchTimeout) {
                clearTimeout(batchTimeout);
            }

            // Set new timeout to handle the batch
            batchTimeout = setTimeout(() => {
                if (newMessagesInBatch && isEnabled) {
                    console.log('Processing batch of new messages');
                    translate();
                    initializeMessageObservers();
                    newMessagesInBatch = false;
                }
            }, 500); // Wait for 500ms after last mutation before processing batch
        });

        // Start observing for new messages
        chatObserver.observe(chatContainer, { 
            childList: true, 
            subtree: true,
            characterData: true
        });

        // Cache existing messages
        const initialMessages = document.getElementsByClassName('_akbu');
        Array.from(initialMessages).forEach(msg => {
            if (!chats.includes(msg)) {
                chats.push(msg);
            }
        });
        console.log('Initial messages cached:', chats.length);

        if(isEnabled) {
            translate();
        }
    }

    // Function to initialize observers for messages
    function initializeMessageObservers() {
        console.log('Initializing message observers');
        // Find all elements with _amj_ class and observe for x17t9dm2
        const amjElements = document.querySelectorAll('._amj_');
        
        amjElements.forEach(element => {
            if (element && !element.dataset.observing) {
                element.dataset.observing = 'true';
                
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList') {
                            const hasX17 = element.querySelector('.x17t9dm2');
                            const existingEye = element.querySelector('.eye-button');
                            
                            if (hasX17 && status && !existingEye) {
                                const index = getMessageIndex(hasX17);
                                if(index === -1) return;

                                const eyeButton = document.createElement('img');
                                eyeButton.className = 'eye-button';
                                eyeButton.style.cursor = 'pointer';
                                eyeButton.style.marginLeft = '5px';
                                eyeButton.style.width = '20px';
                                eyeButton.style.height = '20px';
                                eyeButton.style.display = 'inline-block';
                                eyeButton.style.verticalAlign = 'middle';
                                eyeButton.dataset.state = 'closed';
                                
                                // Create background circle
                                const backgroundCircle = document.createElement('div');
                                backgroundCircle.style.position = 'absolute';
                                backgroundCircle.style.width = '28px';
                                backgroundCircle.style.height = '28px';
                                backgroundCircle.style.backgroundColor = '#8696a0';
                                backgroundCircle.style.opacity = '0.1';
                                backgroundCircle.style.borderRadius = '50%';
                                backgroundCircle.style.transform = 'translate(-4px, -4px)';
                                backgroundCircle.style.zIndex = '-1';

                                // Create container for eye and background
                                const container = document.createElement('div');
                                container.style.position = 'relative';
                                container.style.display = 'inline-block';
                                container.appendChild(backgroundCircle);
                                
                                // Load extension images
                                const loadImage = (name) => {
                                    return chrome.runtime.getURL(`images/${name}`);
                                };

                                // Set initial image and styles
                                eyeButton.src = loadImage('closed_eye_white.png');
                                
                                // Debug image loading
                                eyeButton.onerror = () => {
                                    console.error('Failed to load eye image:', eyeButton.src);
                                    eyeButton.style.backgroundColor = 'white';
                                    eyeButton.style.padding = '2px';
                                    eyeButton.style.borderRadius = '50%';
                                };
                                eyeButton.onload = () => console.log('Successfully loaded eye image:', eyeButton.src);

                                const messageElement = chats[index].querySelector('._ao3e');
                                if (messageElement) {
                                    seenMessage = messageElement.textContent; // Store the original message
                                }
                                
                                // Add click event listener
                                eyeButton.addEventListener('click', () => {
                                    if (eyeButton.dataset.state === 'closed') {
                                        seeOriginal(index);
                                        eyeButton.src = loadImage('open_eye_white.png');
                                        eyeButton.dataset.state = 'open';
                                    } else {
                                        unSeeOriginal(index);
                                        eyeButton.src = loadImage('closed_eye_white.png');
                                        eyeButton.dataset.state = 'closed';
                                    }
                                });
                                
                                container.appendChild(eyeButton);
                                element.appendChild(container);
                            } 
                            else if ((!hasX17 || !status) && existingEye) {
                                const index = getMessageIndex(element);
                                if (index !== -1) {
                                    const messageElement = chats[index].querySelector('._ao3e');
                                    if (messageElement && seenMessage && existingEye.dataset.state === 'open') {
                                        messageElement.textContent = seenMessage;
                                    }
                                }
                                // Remove the entire container
                                const container = existingEye.parentElement;
                                if (container && container.parentElement) {
                                    container.parentElement.removeChild(container);
                                }
                            }
                        }
                    });
                });
                
                observer.observe(element, {
                    childList: true,
                    subtree: true,
                    characterData: true
                });
            }
        });
    }

    // Function to find the index of _akbu element that shares the same _amk4 parent
    function getMessageIndex(x17Element) {
        // Return -1 if element is null or undefined
        if (!x17Element) {
            console.log('Invalid element passed to getMessageIndex');
            return -1;
        }
        
        // Find the parent _amk4 element
        const parentAmk4 = x17Element.closest('._amk4');
        if (!parentAmk4) {
            console.log('No _amk4 parent found');
            return -1;
        }

        // Get the target akbu element
        const akbuElement = parentAmk4.querySelector('._akbu');
        if (!akbuElement) {
            console.log('No _akbu element found');
            return -1;
        }

        // Find its index in the chats array
        const index = chats.indexOf(akbuElement);
        console.log('Found _akbu element at index:', index);
        return index;
    }

    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        try {
            // Update all variables from the message
            isEnabled = message.isEnabled ?? isEnabled;
            isFormal = message.isFormal ?? isFormal;
            isFranco = message.isFranco ?? isFranco;
            senderLanguage = message.senderLanguage ?? senderLanguage;
            senderDialect = message.senderDialect ?? senderDialect;
            senderGender = message.senderGender ?? senderGender;
            receiverLanguage = message.receiverLanguage ?? receiverLanguage;
            receiverDialect = message.receiverDialect ?? receiverDialect;
            receiverGender = message.receiverGender ?? receiverGender;
            
            // Call appropriate function based on isEnabled
            if(status || isEnabled){
                if (isEnabled) {
                    translate();
                } else {
                    revert();
                }
            }
            if((currentLanguage != senderLanguage || currentDialect != senderDialect) && status && isEnabled){
                revert();
                translate();
            }

            // Send success response
            sendResponse({ success: true });
        } catch (error) {
            console.error('Error processing message:', error);
            sendResponse({ success: false, error: error.message });
        }
        return true; // Keep the message channel open for async response
    });

    // Function to wait for an element to be present in the DOM
    function waitForElement(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    // Function to get text content including emojis
    function getMessageContent(element) {
        if (!element) return '';
        
        let fullText = '';
        const messageSpan = element.querySelector('._ao3e');
        if (!messageSpan) return element.innerText || '';
        
        // Process all child nodes
        function processNode(node) {
            if (!node) return;
            
            if (node.nodeType === Node.TEXT_NODE) {
                fullText += node.textContent || '';
            } else if (node.nodeName === 'IMG' && node.classList?.contains('emoji')) {
                fullText += node.getAttribute('data-plain-text') || '';
            } else if (node.childNodes && node.childNodes.length > 0) {
                node.childNodes.forEach(child => {
                    if (child) processNode(child);
                });
            }
        }

        processNode(messageSpan);
        return fullText || messageSpan.innerText || '';
    }

    // Initialize contact click listener
    async function initializeContactListener() {
        try {
            const contactElement = await waitForElement(".x1y332i5");
            console.log('Contact element found');
            
            contactElement.addEventListener("click", () => {
                console.log('Contact clicked');
                revert();
                chats = [];
                originalChats = [];
                // Initialize or reinitialize the observer
                setTimeout(initializeChatObserver, 1000); // Give WhatsApp a moment to load the chats
            });
        } catch (error) {
            console.error('Error setting up contact listener:', error);
        }    
    }

    // Start the initialization
    initializeContactListener();

    async function translate() {
        console.log('Translating messages...', chats.length);
        let toBeTranslated = [];
        let last = originalChats.length
        for(let i=last; i<chats.length; i++){
            const messageContent = getMessageContent(chats[i]);
            originalChats.push(messageContent);
            toBeTranslated.push(messageContent);
        }
       
        if(currentLanguage != senderLanguage || currentDialect != senderDialect || !status){
            toBeTranslated = originalChats;
            currentLanguage = senderLanguage;
            currentDialect = senderDialect;
            last = 0;
        }
        console.log(originalChats);
        console.log(toBeTranslated);
        if(toBeTranslated.length == 0){
            console.log('No new messages to translate');
            return;
        }
        const prompt = `Translate the following list of chats (given in the form ["chat1","chat2","chat3"] and output them in the same form exactly and NO EXTRA SPACES) from person R to person S , to ${senderLanguage == 'Arabic' ? senderDialect : ''} ${isFranco && senderLanguage == 'Arabic'?'Franco (like azik 3amel eih)':''} ${senderLanguage} ${senderGender != '' ? ', person S is a ' + senderGender: '' } ${receiverGender != '' ? ', person R is a ' + receiverGender: '' } (only output translation and if the text is already in the target language then leave it as it is, and dont write the gender after the translation): [${toBeTranslated.map(chat=> `" ${chat} "`).join(',')}]`;
        console.log(prompt);
        let result;
        try {
            result = await model.generateContent(prompt);
            console.log(result.response.text());
        } 
        catch (error) {
            status = false;
            setTimeout(translate(), 10000);
            return;
        }
        let resultChats = result.response.text();
        resultChats =fixOutputFormat(resultChats); 
        for(let i=0; i<resultChats.length; i++,last++)
            if(!chats[i].classList.contains('_akbw'))
                chats[last].querySelector('._ao3e').textContent = resultChats[i];
            
        status = true;
        initializeMessageObservers();
        console.log("Translated successfully");
    }

    function revert() {
        console.log('Reverting messages...', chats.length);
        if(originalChats.length != chats.length)
            return;
        for(let i = 0; i<chats.length; i++)
            if(!chats[i].classList.contains('_akbw'))
                chats[i].querySelector('._ao3e').textContent = originalChats[i];
        status = false;
        console.log('Reverted messages');
    }
    document.addEventListener("keydown", (event) => {
        try {
            let element = document.querySelector("._ak1r").querySelector(".x15bjb6t").querySelector(".selectable-text")
            if(event.key === 'F2' && element !== null && isEnabled) {
                console.log('F2 pressed');
                translateSender(element);    
            }
        } catch (Exception) {
            console.log(Exception);
        }
    });
    async function translateSender(element){
        const text = getMessageContent(element.parentElement);
        const prompt = `Translate the following text from person S to person R , to ${receiverLanguage == 'Arabic' ? receiverDialect : ''} ${isFranco && receiverLanguage == 'Arabic'?'Franco (like azik 3amel eih)':''} ${receiverLanguage} ${isFormal?'and make the translation formal':''} ${senderGender != '' ? ', person S is a ' + senderGender: '' } ${receiverGender != '' ? ', person R is a ' + receiverGender: '' } (ONLY output the translation and if the text is already in the target language then leave it as it is AND DONT ADD ANY ADDITIONAL SPACE): ${text}`;
        console.log(prompt);
        let result;
        try {
            result = await model.generateContent(prompt);
            let resultText = result.response.text();
            if(resultText.charAt(resultText.length - 1) === '\n' || resultText.charAt(resultText.length - 1) === ' ')
                resultText = resultText.slice(0, -1);
            navigator.clipboard.writeText(resultText);
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
        } 
        catch (error) {
            return navigator.clipboard.writeText(text + ", Try again in a few seconds.");
        }
    }
    function fixOutputFormat(output) {
        let start = 0;
        let end = 0;
        for(let i = 0; i<output.length; i++)
            if(output.charAt(i) == `"`){
                start = i+1;
                break;
            }     
        for(let i = output.length-1; i>=0; i--)
            if(output.charAt(i) == `"`){
                end = i;
                break;
            }
        return output.substring(start, end).split(`","`);
    }
    function seeOriginal(index) {
        if(index >= 0 && index < chats.length){
            seenMessage = chats[index].querySelector('._ao3e').textContent;
            chats[index].querySelector('._ao3e').textContent = originalChats[index];
        }
            
    }
    function unSeeOriginal(index) {
        if(!chats[index].classList.contains('_akbw'))
            chats[index].querySelector('._ao3e').textContent = seenMessage;
    }
})();
