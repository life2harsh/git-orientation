// Wire the CRT UI to GitWorkshop hashing
(function(){
  const canvas = document.getElementById('crt-canvas');
  const usernameEl = document.getElementById('crt-username');
  const answerEl = document.getElementById('crt-answer');
  const genBtn = document.getElementById('crt-generate');
  const copyBtn = document.getElementById('crt-copy');
  const outputEl = document.getElementById('crt-output');
  const statusEl = document.getElementById('crt-status');

  if (!canvas || !usernameEl || !answerEl || !genBtn || !copyBtn || !outputEl) return;

  async function generate(){
    statusEl.textContent = 'Generating...';
    try{
      const username = usernameEl.value.trim();
      const answer = answerEl.value.trim();
      if(!username || !answer){
        statusEl.textContent = 'Please enter both username and answer';
        return;
      }
      const res = await window.GitWorkshop.generateFinalHash(username, answer);
      outputEl.textContent = res.output; // finalHash:nonce
      statusEl.textContent = 'Done';
    }catch(err){
      console.error(err);
      statusEl.textContent = 'Error generating hash';
    }
  }

  async function copy(){
    const text = outputEl.textContent.trim();
    if(!text || text === '—'){
      statusEl.textContent = 'Nothing to copy'; return;
    }
    try{
      await navigator.clipboard.writeText(text);
      statusEl.textContent = 'Copied to clipboard';
    }catch(err){
      console.error(err);
      statusEl.textContent = 'Copy failed';
    }
  }

  genBtn.addEventListener('click', generate);
  copyBtn.addEventListener('click', copy);

  // Enter key triggers generate from the answer field
  answerEl.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') generate(); });
})();
