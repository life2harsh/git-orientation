document.addEventListener('DOMContentLoaded', () => {

    const DECRYPTION_KEY = 'Th1s_1s_a_S@mpl3_S3cure_K3y_32ch';

    const questionsContainer = document.getElementById('questions-container');
    const submissionForm = document.getElementById('submission-form');
    const questionTitle = document.getElementById('question-title');
    let selectedQuestionId = null;

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
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    async function importKey(keyString) {
        const keyBytes = new TextEncoder().encode(keyString);
        return await crypto.subtle.importKey(
            "raw",
            keyBytes,
            { name: "AES-GCM" },
            false,
            ["decrypt"]
        );
    }

    async function loadAndDecryptQuestions() {
        try {
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

            const decrypted = await crypto.subtle.decrypt(
                { name: "AES-GCM", iv: nonce },
                key,
                fullCiphertext
            );

            const decryptedText = new TextDecoder().decode(decrypted);
            const questions = JSON.parse(decryptedText);
            displayQuestions(questions);

        } catch (error) {
            console.error('Decryption failed:', error);
            questionsContainer.innerHTML = '<h2>Git Workshop Challenge</h2><p style="color: red;">Could not load or decrypt questions.</p>';
        }
    }

    function displayQuestions(questions) {
        questionsContainer.innerHTML = '<h2>Select a Question:</h2>';
        questions.forEach(q => {
            const button = document.createElement('button');
            button.className = 'question-btn';
            button.textContent = `Question ${q.id}`;
            button.dataset.id = q.id;
            button.dataset.question = q.question;
            button.addEventListener('click', () => selectQuestion(q));
            questionsContainer.appendChild(button);
        });
    }

    function selectQuestion(question) {
        selectedQuestionId = question.id;
        questionTitle.textContent = `Submitting for Q${question.id}: ${question.question}`;
        submissionForm.classList.remove('hidden');
        document.getElementById('result').classList.add('hidden');
        document.querySelectorAll('.question-btn').forEach(btn => btn.style.backgroundColor = '');
        const selectedBtn = document.querySelector(`.question-btn[data-id='${question.id}']`);
        selectedBtn.style.backgroundColor = '#0056b3';
    }

    async function handleGenerate() {
        const username = document.getElementById('username').value.trim();
        const answer = document.getElementById('answer').value.trim();
        if (!username || !answer) return alert("Please provide a username and an answer.");

        const nonce = generateNonce();
        const usernameHash = await sha256(username);
        const answerHash = await sha256(answer);
        const finalHash = await sha256(usernameHash + answerHash + nonce);
        const outputString = `${finalHash}:${nonce}`;
        document.getElementById('output').textContent = outputString;
        document.getElementById('result').classList.remove('hidden');
    }

    document.getElementById('generate-btn').addEventListener('click', handleGenerate);
    loadAndDecryptQuestions();
});