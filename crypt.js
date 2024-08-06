
function encrypt(text, password) {
    
    const data = { text, password };
    
    fetch('http://127.0.0.1:5000/encrypt', {
    method: 'POST',
    headers: {      
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        return data;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function decrypt(text, password) {
    
    const data = { text, password };

    fetch('http://127.0.0.1:5000/decrypt', {
    method: 'POST',
    headers: {      
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        return data;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
document.getElementById("encryptButton").addEventListener("click",()=>{
    encrypt(document.getElementById("textInput").value,document.getElementById("passwordInput").value);
});
document.getElementById("decryptButton").addEventListener("click",()=>{
    decrypt(document.getElementById("textInput").value,document.getElementById("passwordInput").value);
});