import os
import json
import hashlib
import sys
import requests

TOKEN = os.getenv("GITHUB_TOKEN")
REPO  = os.getenv("GITHUB_REPOSITORY")
PRNUM = os.getenv("GITHUB_PR_NUMBER")

HEADERS_JSON = {"Authorization": f"token {TOKEN}", "Accept": "application/vnd.github+json"}
HEADERS_CONTENTS_RAW = {"Authorization": f"token {TOKEN}", "Accept": "application/vnd.github.raw"}
HEADERS_RAW_URL = {"Authorization": f"token {TOKEN}"}

if not TOKEN or not REPO or not PRNUM:
    print(f"Missing env vars. "
          f"GITHUB_TOKEN set? {bool(TOKEN)} "
          f"GITHUB_REPOSITORY={REPO!r} "
          f"GITHUB_PR_NUMBER={PRNUM!r}")
    sys.exit(1)

def get_pr_author():
    url = f"https://api.github.com/repos/{REPO}/pulls/{PRNUM}"
    r = requests.get(url, headers=HEADERS_JSON)
    r.raise_for_status()
    return r.json()["user"]["login"]

def get_changed_files():
    url = f"https://api.github.com/repos/{REPO}/pulls/{PRNUM}/files?per_page=100"
    r = requests.get(url, headers=HEADERS_JSON)
    r.raise_for_status()
    data = r.json()
    return [
        {"filename": f["filename"], "raw_url": f.get("raw_url"), "contents_url": f.get("contents_url")}
        for f in data
    ]

def fetch_file_text(filemeta):
    if filemeta.get("raw_url"):
        r = requests.get(filemeta["raw_url"], headers=HEADERS_RAW_URL)
        if r.status_code < 400:
            return r.text
    if filemeta.get("contents_url"):
        r = requests.get(filemeta["contents_url"], headers=HEADERS_CONTENTS_RAW)
        r.raise_for_status()
        return r.text
    raise RuntimeError(f"No usable URL for {filemeta['filename']}")

def sha256(message):
    return hashlib.sha256(message.encode('utf-8')).hexdigest()

def verify_submission():
    user  = get_pr_author()
    files = get_changed_files()
    
    for f in files:
        filename = f["filename"]
        try:
            content = fetch_file_text(f).strip()
            parts = content.split(":", 1)
            if len(parts) != 2:
                raise ValueError("Expected '<hash>:<nonce>'")
            submitted_hash, nonce = parts[0].strip(), parts[1].strip()

            question_id = int(filename.split("_q")[1].split(".txt")[0])
        except (requests.RequestException, ValueError, KeyError, IndexError) as e:
            print(f"Error: Could not read or parse the submission file: {filename}({e})")
            sys.exit(1)

        answers_json = os.getenv('CORRECT_ANSWERS_JSON')
        if not answers_json:
            print("Error: CORRECT_ANSWERS_JSON secret is not set.")
            sys.exit(1)

        correct_answers = json.loads(answers_json)
        correct_answer = correct_answers.get(question_id) or correct_answers.get(str(question_id))
        if not correct_answer:
            print(f"Error: No answer found for question ID {question_id}.")
            sys.exit(1)

        username_hash = sha256(user)
        answer_hash = sha256(str(correct_answer))
        expected_hash = sha256(username_hash + answer_hash + nonce)

        if expected_hash == submitted_hash:
            print(f"Answer for Q{question_id} by {user} is correct.")
            sys.exit(0) 
        else:
            print(f"Answer for Q{question_id} by {user} is incorrect.")
            sys.exit(1) 

if __name__ == "__main__":
    verify_submission()

