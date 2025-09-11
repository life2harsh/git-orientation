document.addEventListener('DOMContentLoaded', () => {

    const DECRYPTION_KEY = 'Th1s_1s_a_S@mpl3_S3cure_K3y_32ch'; 

    const questionsContainer = document.getElementById('questions-container');
    const submissionForm = document.getElementById('submission-form');
    const questionTitle = document.getElementById('question-title');
    let selectedQuestionId = null;

    async function sha256(message) {  }
    function generateNonce(length = 8) {  }
    function base64ToUint8Array(base64) {  }
    async function importKey(keyString) {  }

    async function loadAndDecryptQuestions() {
        try {

            const response = await fetch('questions.encrypted.json');
            if (!response.ok) throw new Error('Failed to fetch questions file.');

            const encryptedData = await response.json();
            const key = await importKey(DECRYPTION_KEY);

            const decryptedText = new TextDecoder().decode(decrypted);
            const questions = JSON.parse(decryptedText);
            displayQuestions(questions);

        } catch (error) {
            console.error('Decryption failed:', error);
            questionsContainer.innerHTML = '<p style="color: red;">Could not load or decrypt questions.</p>';
        }
    }

    function displayQuestions(questions) {
        questionsContainer.innerHTML = '<h2>Select a Question:</h2>';
        questions.forEach(q => {
            const button = document.createElement('button');
            button.className = 'question-btn';
            button.textContent = `Question ${q.id}`;
            button.addEventListener('click', () => selectQuestion(q));
            questionsContainer.appendChild(button);
        });
    }

    function selectQuestion(question) {
        selectedQuestionId = question.id;
        questionTitle.textContent = `Submitting for Q${question.id}: ${question.question}`;
        submissionForm.classList.remove('hidden');
        document.getElementById('result').classList.add('hidden');
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

