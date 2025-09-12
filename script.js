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
        const questionsContainer = document.getElementById('questions-container');
        questionsContainer.innerHTML = '';
        questions.forEach(q => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-item';
            questionDiv.innerHTML = `
                <h3>Question ${q.id}</h3>
                <p>${q.question}</p>
            `;
            questionDiv.addEventListener('click', () => selectQuestion(q));
            questionsContainer.appendChild(questionDiv);
        });
    }

    function selectQuestion(question) {
        selectedQuestionId = question.id;
        document.querySelectorAll('.question-item').forEach(item => item.classList.remove('selected'));
        event.currentTarget.classList.add('selected');
        const questionTitle = document.getElementById('question-title');
        questionTitle.textContent = `Question ${question.id}: ${question.question}`;
        document.getElementById('submission-form').classList.remove('hidden');
        document.getElementById('result').classList.add('hidden');
        document.getElementById('result').classList.remove('visible');
        document.getElementById('submission-form').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    async function handleGenerate() {
        const username = document.getElementById('username').value.trim();
        const answer = document.getElementById('answer').value.trim();

        if (!username || !answer) {
            alert("Please provide both your GitHub username and answer.");
            return;
        }

        const generateBtn = document.getElementById('generate-btn');
        const originalText = generateBtn.innerHTML;
        generateBtn.innerHTML = '<span class="loading"></span> Generating...';
        generateBtn.disabled = true;

        try {
            const nonce = generateNonce();
            const usernameHash = await sha256(username);
            const answerHash = await sha256(answer);
            const finalHash = await sha256(usernameHash + answerHash + nonce);
            const outputString = `${finalHash}:${nonce}`;
            document.getElementById('output').textContent = outputString;
            const resultSection = document.getElementById('result');
            resultSection.classList.add('visible');
            resultSection.classList.remove('hidden');

            resultSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });

        } catch (error) {
            console.error('Error generating submission:', error);
            alert('Error generating submission string. Please try again.');
        } finally {
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
        }
    }

    function initializeCopyButton() {
        const copyBtn = document.getElementById('copy-btn');
        if (!copyBtn) return;

        copyBtn.addEventListener('click', async () => {
            const output = document.getElementById('output').textContent;

            try {
                await navigator.clipboard.writeText(output);

                copyBtn.classList.add('copied');
                const originalText = copyBtn.querySelector('.copy-text').textContent;
                copyBtn.querySelector('.copy-text').textContent = 'Copied!';

                setTimeout(() => {
                    copyBtn.classList.remove('copied');
                    copyBtn.querySelector('.copy-text').textContent = originalText;
                }, 2000);

            } catch (err) {

                const textArea = document.createElement('textarea');
                textArea.value = output;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);

                copyBtn.querySelector('.copy-text').textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.querySelector('.copy-text').textContent = 'Copy to Clipboard';
                }, 2000);
            }
        });
    }

    function initializeNewChallengeButton() {
        const newChallengeBtn = document.getElementById('new-challenge-btn');
        if (!newChallengeBtn) return;

        newChallengeBtn.addEventListener('click', () => {
            document.getElementById('username').value = '';
            document.getElementById('answer').value = '';
            document.getElementById('result').classList.add('hidden');
            document.getElementById('result').classList.remove('visible');
            document.getElementById('submission-form').classList.add('hidden');
            document.querySelectorAll('.question-item').forEach(item => {
                item.classList.remove('selected');
            });

            document.getElementById('challenge').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        });
    }

    function initializeSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    document.getElementById('generate-btn').addEventListener('click', handleGenerate);

    setTimeout(() => {
        initializeCopyButton();
        initializeNewChallengeButton();
        initializeSmoothScrolling();
    }, 100);

    loadAndDecryptQuestions();
});