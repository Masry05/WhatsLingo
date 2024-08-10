let flagReset = false;
document.getElementById('modeToggle').click();

document.getElementById('passwordForm').addEventListener('submit', function(event) {
    
    event.preventDefault();
    let pass = document.getElementById('password');
    let password = pass.value;

    document.getElementById('passwordForm').style = "display: none;";
    document.getElementById("submitted").style = "";
    document.getElementById("resetPassword").style="";
    document.querySelector(".switch-container").style="";
    
    const pref = {
        password: password,
        submitted: 'Yes',
        status: 'Disabled'
    }
    chrome.runtime.sendMessage(pref);

});

document.getElementById('passwordForm').addEventListener('change',()=>{
    
    const pref = {
        password: document.getElementById('password').value,
        submitted: 'No',
        status: 'Disabled'
    }
    chrome.runtime.sendMessage(pref);

})

document.getElementById('enableToggle').addEventListener('change', function(event) {

    let isEnabled = event.target.checked;
    let text = isEnabled ? 'Enabled' : 'Disabled'
    document.getElementById('toggleLabel').textContent = text;
    if(isEnabled)
        document.getElementById("instructions").style = "";
    else
        document.getElementById("instructions").style = "display: none;";
    chrome.storage.local.get(["password",'submitted',"status"], (result) => {
        let passwords = result['password'];
        const pref = {
            password: passwords,
            submitted: 'Yes',
            status: text
        };
        chrome.runtime.sendMessage(pref);
    });
});

document.getElementById('resetPassword').addEventListener("click", () => {
    
    document.getElementById('password').style = "";
    document.getElementById('password').value = "";
    document.getElementById('passwordForm').style = "";
    document.querySelector(".switch-container").style = "display: none;";
    document.getElementById("resetPassword").style = "display: none;";
    document.getElementById("submitted").style = "display: none;";
    document.getElementById("instructions").style = "display: none;";

    if(document.getElementById('toggleLabel').textContent == "Enabled")
        document.getElementById('enableToggle').click();

    const pref = {
        password: "",
        submitted: "No",
        status: "Disabled"
    }
    chrome.runtime.sendMessage(pref);
});

document.getElementById('togglePassword').addEventListener('click', () => {
    
    let passwordInput = document.getElementById('password');
    let eyeIcon = document.getElementById('eyeIcon');
    chrome.storage.local.get(["theme"], (result) => {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.src = result['theme'] === "dark" ? 'images/closed_eye_white.png':'images/closed_eye_dark.png';
            eyeIcon.alt = 'Hide';
        } else {
            passwordInput.type = 'password';
            eyeIcon.src = result['theme'] === "dark" ? 'images/open_eye_white.png':'images/open_eye_dark.png'; // Replace with the actual path to the closed-eye icon
            eyeIcon.alt = 'Show';
        }
    });
});

chrome.storage.local.get(["password",'submitted',"status"],(result)=>{
    
    const password = result['password'];
    const submitted = result['submitted'] == "Yes";
    const isEnabled = result['status'] == "Enabled";

    if(!submitted){
        document.getElementById('password').value = password;
        document.getElementById('password').style = "";
        document.getElementById('passwordForm').style = "";
        document.querySelector(".switch-container").style = "display: none;";
        document.getElementById("resetPassword").style = "display: none;";
        document.getElementById("submitted").style = "display: none;";
    }

    else{
        document.getElementById('passwordForm').style = "display: none;";
        document.getElementById("submitted").style = "";
        document.getElementById("resetPassword").style="";
        document.querySelector(".switch-container").style="";
        
        if(isEnabled){
            document.getElementById('enableToggle').click();
            document.getElementById("instructions").style = "";
        }
        
    }
     
});

// Initial load: Check for saved mode preference
chrome.storage.local.get(["theme"], (result) => {
    let isDarkMode = result['theme'] === "dark";
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.getElementById('modeToggle').checked = isDarkMode;
    document.getElementById('modeLabel').textContent = isDarkMode ? 'Dark Mode' : 'Light Mode';

});

// Event listener for mode toggle switch
document.getElementById('modeToggle').addEventListener('change', function(event) {
    let isDarkMode = event.target.checked;
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.getElementById('modeLabel').textContent = isDarkMode ? 'Dark Mode' : 'Light Mode';
    let eyeIcon = document.getElementById('eyeIcon');
    console.log(isDarkMode);
    if(isDarkMode){
        console.log(document.getElementById('password').type)
        switch(document.getElementById('password').type){
            case "password": eyeIcon.src = "images/open_eye_white.png";break;
            case "text": eyeIcon.src = "images/closed_eye_white.png";break;
        }
    }
    else{
        switch(document.getElementById('password').type){
            case "password": eyeIcon.src = "images/open_eye_dark.png";break;
            case "text": eyeIcon.src = "images/closed_eye_dark.png";break;
        }
    }
    chrome.storage.local.set({ "theme": isDarkMode ? "dark" : "light" });
});


