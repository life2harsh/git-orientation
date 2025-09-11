from Crypto.Cipher import AES
import json
import base64
KEY = b'Th1s_1s_a_S@mpl3_S3cure_K3y_32ch'

def encrypt_questions():
    print("Encrypting questions.json...")

    try:
        with open('questions.json', 'r') as f:
            plaintext = f.read()
    except FileNotFoundError:
        print("Error: questions.json not found. Please create it first.")
        return

    cipher = AES.new(KEY, AES.MODE_GCM)
    ciphertext, tag = cipher.encrypt_and_digest(plaintext.encode('utf-8'))

    encrypted_data = {
        'nonce': base64.b64encode(cipher.nonce).decode('utf-8'),
        'ciphertext': base64.b64encode(ciphertext).decode('utf-8'),
        'tag': base64.b64encode(tag).decode('utf-8')
    }

    with open('questions.encrypted.json', 'w') as f:
        json.dump(encrypted_data, f)

    print("created questions.encrypted.json")

if __name__ == "__main__":
    if len(KEY) != 32:
        raise ValueError("Encryption key must be 32 bytes long.")
    encrypt_questions()