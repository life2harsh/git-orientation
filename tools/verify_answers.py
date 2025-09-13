import os
import json
import hashlib
import sys

def sha256(message):
    return hashlib.sha256(message.encode('utf-8')).hexdigest()

def verify_submission():

    branch_name = os.getenv('GITHUB_HEAD_REF')
    if not branch_name:
        print("Error: Could not determine branch name.")
        sys.exit(1)

    parts = branch_name.split('-')
    username = parts[1]
    question_id = parts[2].replace('q', '')

    submission_file = f"submissions/{username}/{username}_q{question_id}.txt"
    try:
        with open(submission_file, 'r') as f:
            content = f.read().strip()
        submitted_hash, nonce = content.split(':')
    except (FileNotFoundError, ValueError):
        print(f"Error: Could not read or parse the submission file: {submission_file}")
        sys.exit(1)

    answers_json = os.getenv('CORRECT_ANSWERS_JSON')
    if not answers_json:
        print("Error: CORRECT_ANSWERS_JSON secret is not set.")
        sys.exit(1)

    correct_answers = json.loads(answers_json)
    correct_answer = correct_answers.get(question_id)
    if not correct_answer:
        print(f"Error: No answer found for question ID {question_id}.")
        sys.exit(1)

    username_hash = sha256(username)
    answer_hash = sha256(correct_answer)
    expected_hash = sha256(username_hash + answer_hash + nonce)

    if expected_hash == submitted_hash:
        print(f"Answer for Q{question_id} by {username} is correct.")
        sys.exit(0) 
    else:
        print(f"Answer for Q{question_id} by {username} is incorrect.")
        sys.exit(1) 

if __name__ == "__main__":
    verify_submission()
