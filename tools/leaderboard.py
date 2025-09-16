import os, re, json, subprocess
from collections import defaultdict

BASE_DIR    = os.environ.get("BASE_DIR", "submissions")
OUTPUT_JSON = os.environ.get("OUTPUT_JSON", "scores.json")
DECAY       = float(os.environ.get("BONUS_DECAY", "0.5"))
REV         = os.environ.get("ANALYZE_REV", "HEAD")

def run_git(cmd_args, cwd="."):
    output = subprocess.check_output(
        cmd_args,
        cwd=cwd,
        text=True,
        stderr=subprocess.DEVNULL
    )
    return output


def first_commit_iso(pathspec):
    output = run_git([
        "git", "log", REV, "--follow", "--format=%aI", "--", pathspec
    ])
    lines = []
    for line in output.splitlines():
        cleaned = line.strip()
        if cleaned:
            lines.append(cleaned)
    if len(lines) == 0:
        return None
    # the last line gonna be the last commit date
    return lines[-1]


def question_number(user, filename):
    pattern = rf"^{re.escape(user)}_q(\d+)(?:\..+)?$"
    match = re.match(pattern, filename, re.IGNORECASE)
    if match is None:
        return None
    number_str = match.group(1)
    return int(number_str)

all_entries = os.listdir(BASE_DIR)
users = []
for entry in all_entries:
    full_path = os.path.join(BASE_DIR, entry)
    if not os.path.isdir(full_path):
        continue
    if entry.startswith("."):
        continue
    users.append(entry)

users.sort()
base_counts = {}
per_q_times = defaultdict(list)

for user in users:
    path = os.path.join(BASE_DIR, user)
    count = 0
    for fname in os.listdir(path):
        full = os.path.join(path, fname)
        if not os.path.isfile(full): 
            continue
        ques = question_number(user, fname)
        if ques is None: 
            continue
        count += 1
        iso = first_commit_iso(os.path.join(BASE_DIR, user, fname))
        if iso: per_q_times[ques].append((user, iso))
    base_counts[user] = count

bonus_for_user = defaultdict(float)

for ques, lst in per_q_times.items():
    lb = sorted(lst, key=lambda x: (x[1], x[0]))
    rank, prev_iso = 0, None
    for user, iso in lb:
        if iso != prev_iso:
            rank = rank + 1 if prev_iso else 1
            prev_iso = iso
        bonus_for_user[user] += DECAY ** (rank - 1)

final_scores = {u: base_counts.get(u, 0) + bonus_for_user.get(u, 0.0) for u in users}

with open(OUTPUT_JSON, "w") as f:
    json.dump(final_scores, f, indent=2, sort_keys=True)

print("Score json updated")


