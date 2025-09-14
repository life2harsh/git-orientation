import os
import json
import hashlib
import sys
import requests

TOKEN = os.getenv("GITHUB_TOKEN")
REPO  = os.getenv("GITHUB_REPOSITORY")
PRNUM = os.getenv("GITHUB_PR_NUMBER")

HEADERS = {"Authorization": f"token {TOKEN}", "Accept": "application/vnd.github+json"}
HEADERS_RAW = {"Authorization": f"token {TOKEN}", "Accept": "application/vnd.github.raw"}

if not TOKEN or not REPO or not PRNUM:
    print(f"Missing env vars. "
          f"GITHUB_TOKEN set? {bool(TOKEN)} "
          f"GITHUB_REPOSITORY={REPO!r} "
          f"GITHUB_PR_NUMBER={PRNUM!r}")
    sys.exit(1)

def get_pr_author():
    url = f"https://api.github.com/repos/{REPO}/pulls/{PRNUM}"
    r = requests.get(url, headers=HEADERS)
    r.raise_for_status()
    return r.json()["user"]["login"]

def get_changed_files():
    url = f"https://api.github.com/repos/{REPO}/pulls/{PRNUM}/files?per_page=100"
    r = requests.get(url, headers=HEADERS)
    r.raise_for_status()
    data = r.json()
    return [{"filename": f["filename"], "contents_url": f.get("contents_url") or f.get("raw_url")} for f in data]

def sha256(message):
    return hashlib.sha256(message.encode('utf-8')).hexdigest()

def verify_submission():
    user  = get_pr_author()
    files = get_changed_files()
    
    for f in files:
        try:
            filename = f["filename"]
            r = requests.get(f["contents_url"], headers=HEADERS_RAW)
            r.raise_for_status()
            content = r.text.strip()
            question_id = int(filename.split("_q")[1].split(".txt")[0])
            submitted_hash, nonce = content.split(':')
        except (requests.RequestException, ValueError, KeyError):
            print(f"Error: Could not read or parse the submission file: {filename}")
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

