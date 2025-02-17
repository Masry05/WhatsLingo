// Variables to store selections
let senderLanguage = '';
let senderDialect = '';
let senderGender = '';
let receiverLanguage = '';
let receiverDialect = '';
let receiverGender = '';
let isFormal = false;
let isEnabled = false;
let isFranco = false;

// Load saved values from local storage
function loadSavedValues() {
    senderLanguage = localStorage.getItem('senderLanguage') || '';
    senderDialect = localStorage.getItem('senderDialect') || '';
    senderGender = localStorage.getItem('senderGender') || '';
    receiverLanguage = localStorage.getItem('receiverLanguage') || '';
    receiverDialect = localStorage.getItem('receiverDialect') || '';
    receiverGender = localStorage.getItem('receiverGender') || '';
    isFormal = localStorage.getItem('isFormal') === 'true';
    isEnabled = localStorage.getItem('isEnabled') === 'true';
    isFranco = localStorage.getItem('isFranco') === 'true';

    // Update UI with saved values
    if (senderLanguage) {
        document.getElementById('sender-language').value = senderLanguage;
        if (senderLanguage === 'Arabic') {
            document.getElementById('sender-dialect-container').style.display = 'block';
            document.getElementById('sender-dialect-container').classList.add('slide-down');
        }
    }
    if (senderDialect) {
        document.getElementById('sender-dialect').value = senderDialect;
    }
    if (receiverLanguage) {
        document.getElementById('receiver-language').value = receiverLanguage;
        if (receiverLanguage === 'Arabic') {
            document.getElementById('receiver-dialect-container').style.display = 'block';
            document.getElementById('receiver-dialect-container').classList.add('slide-down');
        }
    }
    if (receiverDialect) {
        document.getElementById('receiver-dialect').value = receiverDialect;
    }
    if (senderGender) {
        const radio = document.querySelector(`input[name="sender-gender"][value="${senderGender}"]`);
        if (radio) radio.checked = true;
    }
    if (receiverGender) {
        const radio = document.querySelector(`input[name="receiver-gender"][value="${receiverGender}"]`);
        if (radio) radio.checked = true;
    }
    document.getElementById('formal-checkbox').checked = isFormal;
    document.getElementById('franco-checkbox').checked = isFranco;
    document.getElementById('enableToggle').checked = isEnabled;
    let text = isEnabled ? 'Enabled' : 'Disabled'
    document.getElementById('toggleLabel').textContent = text;

    // Update franco label visibility
    const francoLabel = document.getElementById('franco-label');
    if (senderLanguage === 'Arabic' || receiverLanguage === 'Arabic') {
        francoLabel.style = '';
    } else {
        francoLabel.style = 'display: none;';
    }

    // Update switch container visibility
    if (senderLanguage !== '' && receiverLanguage !== '') {
        document.querySelector('.switch-container').style = '';
    } else {
        document.querySelector('.switch-container').style = 'display: none;';
    }
    if(isEnabled){
        saveAndNotify('isEnabled', isEnabled);
    }
}

// Function to save values to local storage and send message if enabled
function saveAndNotify(key, value) {
    localStorage.setItem(key, value);
    chrome.runtime.sendMessage({
        senderLanguage,
        senderDialect,
        senderGender,
        receiverLanguage,
        receiverDialect,
        receiverGender,
        isFormal,
        isEnabled,
        isFranco
    });
}

// Load saved values when popup opens
document.addEventListener('DOMContentLoaded', loadSavedValues);

// Language and dialect selection handlers
document.getElementById('sender-language').addEventListener('change', function () {
    senderLanguage = this.value;
    saveAndNotify('senderLanguage', senderLanguage);
    const dialectContainer = document.getElementById('sender-dialect-container');
    const francoLabel = document.getElementById('franco-label');
    if (this.value === 'Arabic') {
        dialectContainer.style.display = 'block';
        dialectContainer.classList.add('slide-down');
        francoLabel.style = '';
    } else {
        dialectContainer.style.display = 'none';
        dialectContainer.classList.remove('slide-down');
        francoLabel.style = 'display: none;';
    }
    if(senderLanguage === 'Arabic' || receiverLanguage === 'Arabic'){
        francoLabel.style = '';
    }
    else{
        francoLabel.style = 'display: none;';
        if(isFranco){
            francoLabel.click();
        }
    }
    if(senderLanguage !== '' && receiverLanguage !== '') {
        document.querySelector('.switch-container').style = '';
    }
    else{
        document.querySelector('.switch-container').style = 'display: none;';
        if(isEnabled){
            enableToggle.click();
        }
    }
});

document.getElementById('receiver-language').addEventListener('change', function () {
    receiverLanguage = this.value;
    saveAndNotify('receiverLanguage', receiverLanguage);
    const dialectContainer = document.getElementById('receiver-dialect-container');
    const francoLabel = document.getElementById('franco-label');
    if (this.value === 'Arabic') {
        dialectContainer.style.display = 'block';
        dialectContainer.classList.add('slide-down');
    } else {
        dialectContainer.style.display = 'none';
        dialectContainer.classList.remove('slide-down');
    }
    if(senderLanguage === 'Arabic' || receiverLanguage === 'Arabic'){
        francoLabel.style = '';
    }
    else{
        francoLabel.style = 'display: none;';
        if(isFranco){
            francoLabel.click();
        }
    }
    if(senderLanguage !== '' && receiverLanguage !== '') {
        document.querySelector('.switch-container').style = '';
    }
    else{
        document.querySelector('.switch-container').style = 'display: none;';
        if(isEnabled){
            enableToggle.click();
        }
    }
});

// Dialect selection handlers
document.getElementById('sender-dialect').addEventListener('change', function() {
    senderDialect = this.value;
    saveAndNotify('senderDialect', senderDialect);
});

document.getElementById('receiver-dialect').addEventListener('change', function() {
    receiverDialect = this.value;
    saveAndNotify('receiverDialect', receiverDialect);
});

// Gender selection handlers with toggle functionality
document.querySelectorAll('input[name="sender-gender"]').forEach(radio => {
    radio.addEventListener('click', function() {
        if (this.checked && senderGender === this.value) {
            this.checked = false;
            senderGender = '';
            saveAndNotify('senderGender', '');
        } else {
            senderGender = this.value;
            saveAndNotify('senderGender', senderGender);
        }
    });
});

document.querySelectorAll('input[name="receiver-gender"]').forEach(radio => {
    radio.addEventListener('click', function() {
        if (this.checked && receiverGender === this.value) {
            this.checked = false;
            receiverGender = '';
            saveAndNotify('receiverGender', '');
        } else {
            receiverGender = this.value;
            saveAndNotify('receiverGender', receiverGender);
        }
    });
});

// Formal checkbox handler
document.getElementById('formal-checkbox').addEventListener('change', function() {
    isFormal = this.checked;
    saveAndNotify('isFormal', isFormal);
});

// Franco checkbox handler
document.getElementById('franco-checkbox').addEventListener('change', function() {
    isFranco = this.checked;
    saveAndNotify('isFranco', isFranco);
});

// Enable toggle handler
document.getElementById('enableToggle').addEventListener('change', function() {
    isEnabled = this.checked;
    saveAndNotify('isEnabled', isEnabled);
});

// Dark mode functionality
chrome.storage.local.get(['theme'], (result) => {
    let isDarkMode = result['theme'] === 'dark';
    if (result['theme'] === undefined) {
        chrome.storage.local.set({ 'theme': 'dark' });
        isDarkMode = true;
    }

    document.body.classList.toggle('dark-mode', isDarkMode);
    document.getElementById('modeToggle').checked = isDarkMode;
    document.getElementById('modeLabel').textContent = isDarkMode ? 'Dark Mode' : 'Light Mode';
});

document.getElementById('modeToggle').addEventListener('change', function(event) {
    let isDarkMode = event.target.checked;
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.getElementById('modeLabel').textContent = isDarkMode ? 'Dark Mode' : 'Light Mode';
    chrome.storage.local.set({ 'theme': isDarkMode ? 'dark' : 'light' });
});

document.getElementById('enableToggle').addEventListener('change', function(event) {
    isEnabled = event.target.checked;
    let text = isEnabled ? 'Enabled' : 'Disabled'
    document.getElementById('toggleLabel').textContent = text;
});

// Listen for messages from content.js
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.isEnabled !== undefined)
        enableToggle.click();
});
