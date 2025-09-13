import os
import json
import hashlib
import sys
import requests

TOKEN = os.getenv("GITHUB_TOKEN")
REPO  = os.getenv("GITHUB_REPOSITORY")
PRNUM = os.getenv("GITHUB_PR_NUMBER")

HEADERS = {"Authorization": f"token {TOKEN}", "Accept": "application/vnd.github+json"}

def get_pr_author():
    url = f"https://api.github.com/repos/{REPO}/pulls/{PRNUM}"
    r = requests.get(url, headers=HEADERS)
    r.raise_for_status()
    return r.json()["user"]["login"].lower()

def get_changed_files():
    url = f"https://api.github.com/repos/{REPO}/pulls/{PRNUM}/files?per_page=100"
    r = requests.get(url, headers=HEADERS)
    r.raise_for_status()
    return [f["filename"].lower() for f in r.json()]

def sha256(message):
    return hashlib.sha256(message.encode('utf-8')).hexdigest()

def verify_submission():
    branch_name = os.getenv('GITHUB_HEAD_REF')
    if not branch_name:
        print("Error: Could not determine branch name.")
        sys.exit(1)

    user  = get_pr_author()
    files = get_changed_files()
    
    for path in files:
        try:
            filename = path
            with open(filename, 'r', encoding='utf-8') as fh:
                content = fh.read().strip()
                question_id = int(filename.split("_q")[1].split(".txt")[0])
            submitted_hash, nonce = content.split(':')
        except (FileNotFoundError, ValueError):
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

