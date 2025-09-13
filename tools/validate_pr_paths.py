import os, re, sys, requests

TOKEN = os.getenv("GITHUB_TOKEN")
REPO  = os.getenv("GITHUB_REPOSITORY")   # this for owner/repo
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

# logic: check all files,segregate in ok n not_ok if there exists not_ok OR there exits 0 ok, it will fail.
def validate_files(username, files):
    allowed = re.compile(rf"^submissions/{re.escape(username)}/{re.escape(username)}_q\d+\.txt$")
    valid_files, invalid_files = [], []

    for f in files:
        if allowed.match(f):
            valid_files.append(f)
        else:
            invalid_files.append(f)

    return valid_files, invalid_files

def main():
    if not (TOKEN and REPO and PRNUM):
        print("Missing env: GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_PR_NUMBER")
        sys.exit(1)

    user  = get_pr_author()
    files = get_changed_files()

    valid_files, invalid_files = validate_files(user, files)

    if invalid_files or not valid_files:
        print("Invalid PR contents")
        print("PR author:", user)
        print("Allowed: submissions/{username}/{username}_q{number}.txt")
        print("Changed files:")
        for f in files:
            mark = "✔" if f in valid_files else "✖"
            print(f"   {mark} {f}")
        sys.exit(1)

    print("All changes valid.")
    sys.exit(0)

if __name__ == "__main__":
    main()

