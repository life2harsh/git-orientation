(function (global) {
  'use strict';

  const DECRYPTION_KEY = 'Th1s_1s_a_S@mpl3_S3cure_K3y_32ch';

  async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function generateNonce(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  function base64ToUint8Array(base64) {
    const binaryString = global.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  }

  async function importKey(keyString) {
    const keyBytes = new TextEncoder().encode(keyString);
    return await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['decrypt']);
  }

  async function loadAndDecryptQuestions() {
    const response = await fetch('questions.encrypted.json');
    if (!response.ok) throw new Error('Failed to fetch questions file.');

    const encryptedData = await response.json();
    const key = await importKey(DECRYPTION_KEY);
    const nonce = base64ToUint8Array(encryptedData.nonce);
    const ciphertext = base64ToUint8Array(encryptedData.ciphertext);
    const tag = base64ToUint8Array(encryptedData.tag);
    const fullCiphertext = new Uint8Array(ciphertext.length + tag.length);
    fullCiphertext.set(ciphertext);
    fullCiphertext.set(tag, ciphertext.length);

    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce }, key, fullCiphertext);
    const decryptedText = new TextDecoder().decode(decrypted);
    return JSON.parse(decryptedText);
  }

  async function generateFinalHash(username, answer) {
    if (!username || !answer) throw new Error('username and answer are required');
    const nonce = generateNonce();
    const usernameHash = await sha256(username.trim());
    const answerHash = await sha256(answer.trim());
    const finalHash = await sha256(usernameHash + answerHash + nonce);
    const output = `${finalHash}:${nonce}`;
    return { output, finalHash, nonce, usernameHash, answerHash };
  }

  Object.defineProperty(global, 'GitWorkshop', {
    value: Object.freeze({ sha256, generateNonce, loadAndDecryptQuestions, generateFinalHash }),
    writable: false,
    enumerable: true,
    configurable: false,
  });
})(window);