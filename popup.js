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
    let theme = localStorage.getItem('theme');
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
        if (radio) {
            radio.checked = true;
            let image = radio.parentNode.children[0];
            image.src = `images/${senderGender}.png`;
        }
    }
    else {
        const element = document.getElementById('sender-section');
        const male = element.querySelector('.gender-male');
        const maleImage = male.children[0];
        maleImage.src = `images/male-${theme}.png`;
        const female = element.querySelector('.gender-female');
        const femaleImage = female.children[0];
        femaleImage.src = `images/female-${theme}.png`;
    }
    if (receiverGender) {
        const radio = document.querySelector(`input[name="receiver-gender"][value="${receiverGender}"]`);
        if (radio) {
            radio.checked = true;
            let image = radio.parentNode.children[0];
            image.src = `images/${receiverGender}.png`;
        }
    }
    else {
        const element = document.getElementById('receiver-section');
        const male = element.querySelector('.gender-male');
        const maleImage = male.children[0];
        maleImage.src = `images/male-${theme}.png`;
        const female = element.querySelector('.gender-female');
        const femaleImage = female.children[0];
        femaleImage.src = `images/female-${theme}.png`;
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
    if (isEnabled) {
        saveAndNotify('isEnabled', isEnabled);
    }
    loadTheme();
}

// Dark mode functionality
function loadTheme() {
    let theme = localStorage.getItem('theme');
    let isDarkMode = theme === 'dark';

    if (theme === null) {  // If no theme is set
        isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light'); // Save the default theme
    }

    document.body.classList.toggle('dark-mode', isDarkMode);
    document.getElementById('modeToggle').checked = isDarkMode;
    document.getElementById('modeLabel').textContent = isDarkMode ? 'Dark Mode' : 'Light Mode';
    document.querySelectorAll('.gender-male').forEach(element => {
        const image = element.children[0];
        const radio = element.children[1];
        if (radio.checked) {
            image.src = `images/male.png`;
        }
        else
            image.src = `images/male-${theme}.png`;
        element.addEventListener('mouseover', function (event) {
            image.src = `images/male-${theme == "dark" ? "white" : theme}.png`;
        });
        element.addEventListener('mouseout', function (event) {
            if (radio.checked) {
                image.src = `images/male.png`;
                const femaleImage = element.parentNode.children[1].children[0];
                femaleImage.src = `images/female-${theme}.png`;
            }
            else
                image.src = `images/male-${theme}.png`;
        });
    });
    document.querySelectorAll('.gender-female').forEach(element => {
        const image = element.children[0];
        const radio = element.children[1];
        if (radio.checked) {
            image.src = `images/female.png`;
        }
        else
            image.src = `images/female-${theme}.png`;
        element.addEventListener('mouseover', function (event) {
            image.src = `images/female-${theme == "dark" ? "white" : theme}.png`;
        });
        element.addEventListener('mouseout', function (event) {
            if (radio.checked) {
                image.src = `images/female.png`;
                const maleImage = element.parentNode.children[0].children[0];
                maleImage.src = `images/male-${theme}.png`;
            }
            else
                image.src = `images/female-${theme}.png`;
        });
    });
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
    if (senderLanguage === 'Arabic' || receiverLanguage === 'Arabic') {
        francoLabel.style = '';
    }
    else {
        francoLabel.style = 'display: none;';
        if (isFranco) {
            francoLabel.click();
        }
    }
    if (senderLanguage !== '' && receiverLanguage !== '') {
        document.querySelector('.switch-container').style = '';
    }
    else {
        document.querySelector('.switch-container').style = 'display: none;';
        if (isEnabled) {
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
    if (senderLanguage === 'Arabic' || receiverLanguage === 'Arabic') {
        francoLabel.style = '';
    }
    else {
        francoLabel.style = 'display: none;';
        if (isFranco) {
            francoLabel.click();
        }
    }
    if (senderLanguage !== '' && receiverLanguage !== '') {
        document.querySelector('.switch-container').style = '';
    }
    else {
        document.querySelector('.switch-container').style = 'display: none;';
        if (isEnabled) {
            enableToggle.click();
        }
    }
});

// Dialect selection handlers
document.getElementById('sender-dialect').addEventListener('change', function () {
    senderDialect = this.value;
    saveAndNotify('senderDialect', senderDialect);
});

document.getElementById('receiver-dialect').addEventListener('change', function () {
    receiverDialect = this.value;
    saveAndNotify('receiverDialect', receiverDialect);
});

// Gender selection handlers with toggle functionality
document.querySelectorAll('input[name="sender-gender"]').forEach(radio => {
    radio.addEventListener('click', function () {
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
    radio.addEventListener('click', function () {
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
document.getElementById('formal-checkbox').addEventListener('change', function () {
    isFormal = this.checked;
    saveAndNotify('isFormal', isFormal);
});

// Franco checkbox handler
document.getElementById('franco-checkbox').addEventListener('change', function () {
    isFranco = this.checked;
    saveAndNotify('isFranco', isFranco);
});

// Enable toggle handler
document.getElementById('enableToggle').addEventListener('change', function () {
    isEnabled = this.checked;
    saveAndNotify('isEnabled', isEnabled);
});

document.getElementById('modeToggle').addEventListener('change', function (event) {
    let isDarkMode = event.target.checked;
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.getElementById('modeLabel').textContent = isDarkMode ? 'Dark Mode' : 'Light Mode';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    const mouseoutEvent = new Event('mouseout', { bubbles: true, cancelable: true });
    document.querySelectorAll('.gender-icon-male').forEach(element => element.dispatchEvent(mouseoutEvent));
    document.querySelectorAll('.gender-icon-female').forEach(element => element.dispatchEvent(mouseoutEvent));
    const theme = localStorage.getItem('theme');
    document.querySelectorAll('.gender-male').forEach(element => {
        const image = element.children[0];
        const radio = element.children[1];
        if (radio.checked)
            image.src = `images/male.png`;
        else
            image.src = `images/male-${theme}.png`;
        element.addEventListener('mouseover', function (event) {
            image.src = `images/male-${theme == "dark" ? "white" : theme}.png`;
        });
        element.addEventListener('mouseout', function (event) {
            if (radio.checked) {
                image.src = `images/male.png`;
                const femaleImage = element.parentNode.children[1].children[0];
                femaleImage.src = `images/female-${theme}.png`;
            }
            else
                image.src = `images/male-${theme}.png`;
        });
    });
    document.querySelectorAll('.gender-female').forEach(element => {
        const image = element.children[0];
        const radio = element.children[1];
        if (radio.checked)
            image.src = `images/female.png`;
        else
            image.src = `images/female-${theme}.png`;
        element.addEventListener('mouseover', function (event) {
            image.src = `images/female-${theme == "dark" ? "white" : theme}.png`;
        });
        element.addEventListener('mouseout', function (event) {
            if (radio.checked) {
                image.src = `images/female.png`;
                const maleImage = element.parentNode.children[0].children[0];
                maleImage.src = `images/male-${theme}.png`;
            }
            else
                image.src = `images/female-${theme}.png`;
        });
    });
});

document.getElementById('enableToggle').addEventListener('change', function (event) {
    isEnabled = event.target.checked;
    let text = isEnabled ? 'Enabled' : 'Disabled'
    document.getElementById('toggleLabel').textContent = text;
});

// Listen for messages from content.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.isEnabled !== undefined)
        enableToggle.click();
});