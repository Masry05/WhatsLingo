from flask import Flask, request, jsonify
from flask_cors import CORS
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.scrypt import Scrypt
from base64 import urlsafe_b64encode, urlsafe_b64decode

app = Flask(__name__)
CORS(app)
#CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5500"}})


def derive_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
        backend=default_backend()
    )
    return kdf.derive(password.encode())


@app.route('/encrypt', methods=['POST'])
def encrypt() -> str:
    data = request.json
    salt = b'\xa2\xf9\xe2\xb8\x19\x08\xa9\xdf-\xfd\xdd\x17+\xbeTx'  
    key = derive_key(data['password'], salt)  # Derive a key from the password and salt
    iv = b';\xcbt\xaf4x\xec:T\xfc\x07\xc6\x1fKh\xdf'
    cipher = Cipher(algorithms.AES(key), modes.CFB(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(data['text'].encode()) + encryptor.finalize()
    return jsonify(urlsafe_b64encode(salt + iv + ciphertext).decode('utf-8'))
    

@app.route('/decrypt', methods=['POST'])
def decrypt() -> str:
    try:
        data = request.json
        encrypted_data = urlsafe_b64decode(data['text'])
        salt = encrypted_data[:16]
        iv = encrypted_data[16:32]
        ciphertext = encrypted_data[32:]
        key = derive_key(data['password'], salt)
        cipher = Cipher(algorithms.AES(key), modes.CFB(iv), backend=default_backend())
        decryptor = cipher.decryptor()
        plaintext = decryptor.update(ciphertext) + decryptor.finalize()
        return jsonify(plaintext.decode('utf-8')+" 🔒")
    except (ValueError, KeyError):
        return jsonify("Wrong Password")



if __name__ == '__main__':
    app.run()


