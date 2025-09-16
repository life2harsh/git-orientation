import json, os, sys

BASE_DIR = "submissions"
OUTPUT_JSON = os.environ.get("OUTPUT_JSON", "scores.json")

if not os.path.isdir(BASE_DIR):
    print(f"Directory '{BASE_DIR}' not found.", file=sys.stderr)
    scores = {}
else:
    scores = {}
    for users in sorted(os.listdir(BASE_DIR)):
        path = os.path.join(BASE_DIR, users)
        if os.path.isdir(path):
            count=0
            for ques in os.listdir(path):  
                if os.path.isfile(os.path.join(path, ques)):
                    count+=1
            scores[users] = count

with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(scores, f, indent=2, sort_keys=True)

print(f"Score json updated")

