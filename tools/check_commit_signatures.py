import os
import requests
import sys

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
REPO = os.getenv("GITHUB_REPOSITORY")
PR_NUMBER = os.getenv("GITHUB_PR_NUMBER")

COMMITS_API_URL = f"https://api.github.com/repos/{REPO}/pulls/{PR_NUMBER}/commits"


def get_commits():
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
    }
    response = requests.get(COMMITS_API_URL, headers=headers)
    response.raise_for_status()
    return response.json()


def check_commit_signatures(commits):
    for commit in commits:
        sha = commit["sha"]
        commit_details_url = f"https://api.github.com/repos/{REPO}/commits/{sha}"
        response = requests.get(
            commit_details_url, headers={"Authorization": f"token {GITHUB_TOKEN}"}
        )
        response.raise_for_status()
        commit_details = response.json()

        verification = commit_details["commit"]["verification"]
        verification_payload = verification.get("payload", None)

        if (
            verification_payload is not None
            and "committer GitHub <noreply@github.com>" in verification_payload
            and "Merge pull request #" not in verification_payload
            and "Merge branch '" not in verification_payload
        ):
            return False

    return True


def main():
    try:
        commits = get_commits()
        if not check_commit_signatures(commits):
            sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
