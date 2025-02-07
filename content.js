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
    let translatedChats = [];

    

    // Function to initialize or update the chat observer
    function initializeChatObserver() {
        // Get the chat container and observe for new messages
        const chatContainer = document.querySelector('div[role="application"]');
        if (!chatContainer) {
            //console.log('Chat container not found');
            return;
        }

        // Disconnect existing observer if any
        if (chatObserver) {
            chatObserver.disconnect();
        }

        // Cache initial messages
        const initialMessages = document.getElementsByClassName('_akbu');
        chats = Array.from(initialMessages);
        //console.log('Initial messages cached:', chats.length);

        // If enabled, translate initial messages
        if (isEnabled && chats.length > 0) {
            translate();
        }

        // Create observer for new messages
        chatObserver = new MutationObserver((mutations) => {
            let newMessagesFound = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Check if it's an element node
                            const messages = node.classList?.contains('_akbu') ? 
                                [node] : 
                                Array.from(node.getElementsByClassName('_akbu'));
                            
                            messages.forEach(msg => {
                                if (!chats.includes(msg)) {
                                    chats.push(msg);
                                    newMessagesFound = true;
                                }
                            });
                        }
                    });
                }
            });

            if (newMessagesFound) {
                //console.log('New messages detected, total messages:', chats.length);
                if (isEnabled) {
                    translate();
                }
            }
        });

        // Start observing for new messages
        chatObserver.observe(chatContainer, { 
            childList: true, 
            subtree: true,
            characterData: false // Don't observe text changes
        });
    }

    // Function to initialize observers for messages
    function initializeMessageObservers() {
        //console.log('Initializing message observers');
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
                            const existingRetranslate = element.querySelector('.retranslate-button');
                            
                            if (hasX17 && status && !existingEye) {
                                const index = getMessageIndex(hasX17);
                                if(index === -1) return;

                                const eyeButton = document.createElement('img');
                                eyeButton.className = 'eye-button';
                                eyeButton.style.cursor = 'pointer';
                                eyeButton.style.marginLeft = '5px';
                                eyeButton.style.width = '15px';
                                eyeButton.style.height = '15px';
                                eyeButton.style.display = 'inline-block';
                                eyeButton.style.verticalAlign = 'middle';
                                eyeButton.dataset.state = 'closed';
                                
                                // Create background circle
                                const backgroundCircle = document.createElement('div');
                                backgroundCircle.style.position = 'absolute';
                                backgroundCircle.style.width = '28px';
                                backgroundCircle.style.height = '28px';
                                backgroundCircle.style.backgroundColor = '#000000';
                                backgroundCircle.style.opacity = '0.1';
                                backgroundCircle.style.borderRadius = '50%';
                                backgroundCircle.style.transform = 'translate(-4px, -4px)';
                                backgroundCircle.style.zIndex = '-1';

                                // Create container for eye and background
                                const container = document.createElement('div');
                                container.style.position = 'relative';
                                container.style.display = 'inline-flex';
                                container.style.alignItems = 'center';
                                container.style.justifyContent = 'center';
                                container.style.gap = '5px'; // Add gap between icons
                                container.appendChild(backgroundCircle);

                                // Update eye button styles for better centering
                                eyeButton.style.position = 'relative';
                                eyeButton.style.margin = '0';
                                eyeButton.style.padding = '4px';

                                // Create retranslate button
                                const retranslateButton = document.createElement('div');
                                retranslateButton.className = 'retranslate-button';
                                retranslateButton.innerHTML = '↻';
                                retranslateButton.style.cursor = 'pointer';
                                retranslateButton.style.width = '15px';
                                retranslateButton.style.height = '15px';
                                retranslateButton.style.display = 'inline-flex';
                                retranslateButton.style.alignItems = 'center';
                                retranslateButton.style.justifyContent = 'center';
                                retranslateButton.style.verticalAlign = 'middle';
                                retranslateButton.style.color = 'white';
                                retranslateButton.style.fontSize = '16px';
                                retranslateButton.style.position = 'relative';
                                retranslateButton.style.margin = '0';
                                retranslateButton.style.padding = '4px';
                                retranslateButton.style.transition = 'transform 0.3s ease';
                                retranslateButton.title = 'Retranslate';

                                // Create background circle for retranslate button
                                const retranslateBackground = backgroundCircle.cloneNode();
                                
                                // Create container for retranslate button
                                const retranslateContainer = document.createElement('div');
                                retranslateContainer.style.position = 'relative';
                                retranslateContainer.style.display = 'inline-flex';
                                retranslateContainer.style.alignItems = 'center';
                                retranslateContainer.style.justifyContent = 'center';
                                retranslateContainer.appendChild(retranslateBackground);
                                retranslateContainer.appendChild(retranslateButton);

                                // Add click event listener for retranslate
                                retranslateButton.addEventListener('click', async () => {
                                    // Start rotation animation
                                    retranslateButton.style.animation = 'spin 1s linear infinite';
                                    
                                    try {
                                        await reTranslate(index);
                                    } finally {
                                        // Stop rotation animation
                                        retranslateButton.style.animation = 'none';
                                    }
                                });

                                // Add animation styles for retranslate button
                                const retranslateStyle = document.createElement('style');
                                retranslateStyle.textContent = `
                                    @keyframes spin {
                                        0% { transform: rotate(0deg); }
                                        100% { transform: rotate(360deg); }
                                    }
                                `;
                                document.head.appendChild(retranslateStyle);

                                // Load extension images
                                const loadImage = (name) => {
                                    return chrome.runtime.getURL(`images/${name}`);
                                };

                                // Set initial image and styles
                                eyeButton.src = loadImage('globe_white_crossed.png');
                                eyeButton.title = 'See original message';
                                
                                // Debug image loading
                                eyeButton.onerror = () => {
                                    console.error('Failed to load eye image:', eyeButton.src);
                                    eyeButton.style.backgroundColor = 'white';
                                    eyeButton.style.padding = '2px';
                                    eyeButton.style.borderRadius = '50%';
                                };
                                //eyeButton.onload = () => console.log('Successfully loaded eye image:', eyeButton.src);

                                const messageElement = chats[index].querySelector('._ao3e');
                                if (messageElement) {
                                    seenMessage = messageElement.textContent; // Store the original message
                                }
                                
                                // Add click event listener
                                eyeButton.addEventListener('click', () => {
                                    if (eyeButton.dataset.state === 'closed') {
                                        seeOriginal(index);
                                        eyeButton.src = loadImage('globe_white.png');
                                        eyeButton.title = 'See translated message';
                                        eyeButton.dataset.state = 'open';
                                    } else {
                                        unSeeOriginal(index);
                                        eyeButton.src = loadImage('globe_white_crossed.png');
                                        eyeButton.title = 'See original message';
                                        eyeButton.dataset.state = 'closed';
                                    }
                                });
                                
                                container.appendChild(eyeButton);
                                container.appendChild(retranslateContainer);
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
                            else if ((!hasX17 || !status) && existingRetranslate) {
                                // Remove the entire container
                                const container = existingRetranslate.parentElement;
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
            //console.log('Invalid element passed to getMessageIndex');
            return -1;
        }
        
        // Find the parent _amk4 element
        const parentAmk4 = x17Element.closest('._amk4');
        if (!parentAmk4) {
            //console.log('No _amk4 parent found');
            return -1;
        }

        // Get the target akbu element
        const akbuElement = parentAmk4.querySelector('._akbu');
        if (!akbuElement) {
            //console.log('No _akbu element found');
            return -1;
        }

        // Find its index in the chats array
        const index = chats.indexOf(akbuElement);
        //console.log('Found _akbu element at index:', index);
        return index;
    }

    // Initialize contact click listener
    async function initializeContactListener() {
        try {
            const contactElement = await waitForElement(".x1y332i5");
            //console.log('Contact element found');
            
            contactElement.addEventListener("click", () => {
                //console.log('Contact clicked, reinitializing observer');
                // Reset state
                chats = [];
                originalChats = [];
                translatedChats = [];
                status = false;
                
                // Initialize observer with new chat
                setTimeout(initializeChatObserver, 1000);
            });
        } catch (error) {
            console.error('Error setting up contact listener:', error);
        }    
    }

    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        try {
            const wasEnabled = isEnabled;
            // Update all variables from the message
            isEnabled = message.isEnabled ?? isEnabled;
            senderLanguage = message.senderLanguage ?? senderLanguage;
            senderDialect = message.senderDialect ?? senderDialect;
            senderGender = message.senderGender ?? senderGender;
            receiverLanguage = message.receiverLanguage ?? receiverLanguage;
            receiverDialect = message.receiverDialect ?? receiverDialect;
            receiverGender = message.receiverGender ?? receiverGender;
            isFormal = message.isFormal ?? isFormal;
            isFranco = message.isFranco ?? isFranco;

            if(!wasEnabled && isEnabled){
                showTutorialToast();
                translate();

            }
            // If translation was enabled and is now disabled, revert messages
            if (wasEnabled && !isEnabled) {
                revert();
            }

            // If settings changed while enabled, retranslate
            if (isEnabled && (currentLanguage !== senderLanguage || currentDialect !== senderDialect)) {
                translatedChats = [];
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

    async function translate() {
        if(senderLanguage == '')
            return;

        showLoadingPopup('Translating your chats...'); // Show loading popup

        let toBeTranslated = [];
        let last = originalChats.length
        for(let i=last; i<chats.length; i++){
            const messageContent = getMessageContent(chats[i]);
            originalChats.push(messageContent);
            toBeTranslated.push(messageContent);
        }

        if(originalChats.length != 0 && originalChats.length == translatedChats.length && currentLanguage == senderLanguage && currentDialect == senderDialect){
            removeLoadingPopup();
            for(let i=0; i<chats.length; i++)
                if(!chats[i].classList.contains('_akbw'))
                    chats[i].querySelector('._ao3e').textContent = translatedChats[i];
            //console.log('Already translated');
            status = true; // Set status before initializing observers
            initializeMessageObservers(); // Now observers will find status=true
            return;
        }
        
        if(currentLanguage != senderLanguage || currentDialect != senderDialect){
            toBeTranslated = originalChats;
            currentLanguage = senderLanguage;
            currentDialect = senderDialect;
            last = 0;
        }

        //console.log('Translating messages...', toBeTranslated.length);

        const prompt = `Translate the following list of chats (given in the form ["chat1","chat2","chat3"] and output them in the same form exactly and NO EXTRA SPACES) from person R to person S , to ${senderLanguage == 'Arabic' ? senderDialect : ''} ${isFranco && senderLanguage == 'Arabic'?'Franco (like azik 3amel eih)':''} ${senderLanguage} ${senderGender != '' ? ', person S is a ' + senderGender: '' } ${receiverGender != '' ? ', person R is a ' + receiverGender: '' } (only output translation and if the text is already in the target language then leave it as it is, and dont write the gender after the translation): [${toBeTranslated.map(chat=> `" ${chat} "`).join(',')}]`;
        
        let result;
        try {
            result = await model.generateContent(prompt);
        } catch (error) {
            console.error('Translation error:', error);
            removeLoadingPopup();
            return;
        }
        
        let resultChats = result.response.text();
        resultChats = fixOutputFormat(resultChats); 

        if(!status){
            for(let i=0; i<translatedChats.length; i++)
                if(!chats[i].classList.contains('_akbw'))
                    chats[i].querySelector('._ao3e').textContent = translatedChats[i];
        }

        for(let i=0; i<resultChats.length; i++,last++)
            if(!chats[i].classList.contains('_akbw')){
                chats[last].querySelector('._ao3e').textContent = resultChats[i];
                translatedChats.push(resultChats[i]);
            }
        
        status = true;
        initializeMessageObservers();
        //console.log("Translated successfully");
        if(!isEnabled){
            revert();
            return;
        }
            

        showLoadingPopup('Translation completed!', true); // Show success popup
    }

    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        try {
            const wasEnabled = isEnabled;
            // Update all variables from the message
            isEnabled = message.isEnabled ?? isEnabled;
            senderLanguage = message.senderLanguage ?? senderLanguage;
            senderDialect = message.senderDialect ?? senderDialect;
            senderGender = message.senderGender ?? senderGender;
            receiverLanguage = message.receiverLanguage ?? receiverLanguage;
            receiverDialect = message.receiverDialect ?? receiverDialect;
            receiverGender = message.receiverGender ?? receiverGender;
            isFormal = message.isFormal ?? isFormal;
            isFranco = message.isFranco ?? isFranco;

            if(!wasEnabled && isEnabled){
                translate();
            }
            // If translation was enabled and is now disabled, revert messages and remove popup
            if (wasEnabled && !isEnabled) {
                removeLoadingPopup();
                revert();
            }

            // If settings changed while enabled, retranslate
            if (isEnabled && (currentLanguage !== senderLanguage || currentDialect !== senderDialect)) {
                translatedChats = [];
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

    // Function to create loading popup
    function showLoadingPopup(message, isSuccess = false) {
        // Remove existing popup if any
        removeLoadingPopup();

        const popup = document.createElement('div');
        popup.className = 'translation-popup';
        popup.style.position = 'fixed';
        popup.style.top = '20%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        popup.style.color = 'white';
        popup.style.padding = '20px 40px';
        popup.style.borderRadius = '12px';
        popup.style.zIndex = '999999';
        popup.style.display = 'flex';
        popup.style.alignItems = 'center';
        popup.style.gap = '15px';
        popup.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        popup.style.transition = 'opacity 0.3s ease-in-out';

        if (!isSuccess) {
            // Create loading spinner
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            spinner.style.width = '20px';
            spinner.style.height = '20px';
            spinner.style.border = '3px solid #ffffff';
            spinner.style.borderTop = '3px solid transparent';
            spinner.style.borderRadius = '50%';
            spinner.style.animation = 'spin 1s linear infinite';
            popup.appendChild(spinner);
        } else {
            // Create success checkmark
            const checkmark = document.createElement('div');
            checkmark.innerHTML = '&#10004;';
            checkmark.style.color = '#4CAF50';
            checkmark.style.fontSize = '24px';
            popup.appendChild(checkmark);
        }

        const text = document.createElement('span');
        text.textContent = message;
        text.style.fontFamily = 'Segoe UI, system-ui, sans-serif';
        text.style.fontSize = '16px';
        popup.appendChild(text);

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .translation-popup {
                animation: fadeIn 0.3s ease-out;
            }
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translate(-50%, -60%);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%);
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(popup);

        // If success message, remove after delay
        if (isSuccess) {
            setTimeout(() => {
                popup.style.opacity = '0';
                setTimeout(() => removeLoadingPopup(), 300);
            }, 2000);
        }
    }

    function removeLoadingPopup() {
        const existingPopup = document.querySelector('.translation-popup');
        if (existingPopup) {
            existingPopup.remove();
        }
    }

    function revert() {
        removeLoadingPopup();
        //console.log('Reverting messages...', chats.length);
        if(originalChats.length != chats.length)
            return;
        for(let i = 0; i<chats.length; i++)
            if(!chats[i].classList.contains('_akbw'))
                chats[i].querySelector('._ao3e').textContent = originalChats[i];
        status = false;
        //console.log('Reverted messages');
    }
    document.addEventListener("keydown", (event) => {
        try {
            let element = document.querySelector("._ak1r").querySelector(".x15bjb6t").querySelector(".selectable-text")
            if(event.key === 'F2' && element !== null && isEnabled) {
                //console.log('F2 pressed');
                translateSender(element);    
            }
        } catch (Exception) {
            //console.log(Exception);
        }
    });
    async function translateSender(element){
        const text = getMessageContent(element.parentElement);
        const prompt = `Translate the following text from person S to person R , to ${receiverLanguage == 'Arabic' ? receiverDialect : ''} ${isFranco && receiverLanguage == 'Arabic'?'Franco (like azik 3amel eih)':''} ${receiverLanguage} ${isFormal?'and make the translation formal':''} ${senderGender != '' ? ', person S is a ' + senderGender: '' } ${receiverGender != '' ? ', person R is a ' + receiverGender: '' } (ONLY output the translation and if the text is already in the target language then leave it as it is AND DONT ADD ANY ADDITIONAL SPACE): ${text}`;
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
    async function reTranslate(index) {
        const prompt = `Retranslate the following chat from person R to person S , to ${senderLanguage == 'Arabic' ? senderDialect : ''} ${isFranco && senderLanguage == 'Arabic'?'Franco (like azik 3amel eih)':''} ${senderLanguage} ${senderGender != '' ? ', person S is a ' + senderGender: '' } ${receiverGender != '' ? ', person R is a ' + receiverGender: '' } (only output translation and if the text is already in the target language then leave it as it is, and dont write the gender after the translation , and dont write the input chat in the traslation output), your output should be different from (${translatedChats[index]}): ${originalChats[index]}`;
        //console.log(prompt);
        let result;
        try {
            result = await model.generateContent(prompt);
            let translatedText = result.response.text();
            if(translatedText.charAt(translatedText.length - 1) === '\n' || translatedText.charAt(translatedText.length - 1) === ' ')
                translatedText = translatedText.slice(0, -1);

            // Update the message and translated chats array
            if (!chats[index].classList.contains('_akbw')) {
                chats[index].querySelector('._ao3e').textContent = translatedText;
                translatedChats[index] = translatedText;
            }
            //console.log(translatedText);
        } catch (error) {
            console.error('Translation error:', error);
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

    // Function to show tutorial toast
    function showTutorialToast() {
        // Remove existing toast if any
        const existingToast = document.querySelector('.tutorial-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create toast container
        const toast = document.createElement('div');
        toast.className = 'tutorial-toast';
        toast.style.cssText = `
            position: fixed !important;
            bottom: 24px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            background-color: rgba(0, 0, 0, 0.8) !important;
            color: white !important;
            padding: 12px 24px !important;
            border-radius: 8px !important;
            z-index: 2147483647 !important;
            font-family: Segoe UI, system-ui, sans-serif !important;
            font-size: 14px !important;
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
            opacity: 0;
            transition: opacity 0.3s ease-out !important;
            pointer-events: auto !important;
        `;

        // Create info icon
        const infoIcon = document.createElement('div');
        infoIcon.innerHTML = '💡';
        infoIcon.style.cssText = 'font-size: 20px !important;';

        // Create message
        const message = document.createElement('div');
        message.textContent = 'Before sending your message, press F2 then Ctrl + V';
        message.style.cssText = 'line-height: 1.4 !important; color: white !important;';

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '×';
        closeButton.style.cssText = `
            background: none !important;
            border: none !important;
            color: white !important;
            font-size: 20px !important;
            cursor: pointer !important;
            padding: 0 0 0 12px !important;
            opacity: 0.7;
            transition: opacity 0.2s !important;
        `;
        
        closeButton.onmouseover = () => closeButton.style.opacity = '1';
        closeButton.onmouseout = () => closeButton.style.opacity = '0.7';
        closeButton.onclick = () => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        };

        // Create a wrapper to ensure our toast stays on top
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 2147483647 !important;
            pointer-events: none !important;
        `;

        // Assemble toast
        toast.appendChild(infoIcon);
        toast.appendChild(message);
        toast.appendChild(closeButton);
        wrapper.appendChild(toast);
        document.body.appendChild(wrapper);

        // Trigger fade in
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
        });

        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (wrapper.parentElement) {
                toast.style.opacity = '0';
                setTimeout(() => wrapper.remove(), 300);
            }
        }, 8000);
    }

    // Start the initialization
    initializeContactListener();
})();
