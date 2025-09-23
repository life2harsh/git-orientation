# Git Orientation

A puzzle-style Git and GitHub orientation. Solve questions in the web UI, generate a submission token, and submit your answers via Pull Request. CI validates your PR automatically.

## Using the UI

- Question navigation: the Q buttons at the top switch questions.
- Media: some questions include a video (Watch video) or image (View image) link shown at the top. They open in a new tab.
- Hint Mode: click the small rotating pyramid at the bottom-right of the terminal area to toggle Hint Mode. In Hint Mode, the panel shows a typewriter reveal for Hint and Format. Some questions may provide a Copy value.
- Editing inputs: You can edit your GitHub username and answer any time using the EDIT buttons.
- Generate token: After entering both fields, a token appears under “Hash:”. Use the COPY HASH button in the lower-right to copy it.

Notes on readability and visuals:
- The terminal uses a toned-down CRT/post-processing effect. If WebGL is unavailable, it falls back to 2D.
- Text and glow effects were tuned for clarity; the green theme is softened. Hint Mode flips to a red-on-black theme.

## Submission

All submissions go under `submissions/{your-github-username}/` with a specific filename pattern per question:

- File path format: `submissions/<username>/<username>_q<N>.txt`
  - Example for user `octocat` answering question 3:
    - `submissions/octocat/octocat_q3.txt`

- File contents: a single line with the format `<hash>:<nonce>`
  - Example: `2f5a...be9e:ab12cd34`
  - You generate this from the UI by entering your username and your answer, then copying the token.

Important details:
- The PR author username must match the `<username>` segment in the path. CI uses your PR author login to validate.
- One file per question; submit as many questions as you want in a single PR, following the same pattern.

## How validation works (CI checks)

This repository includes scripts used by CI to validate your PR:

- Path validation: `tools/validate_pr_paths.py`
  - Ensures every changed file is under `submissions/<your-login>/<your-login>_q<N>.txt`.
  - If any file is outside the pattern or there are zero valid files, the check fails.

- Answer verification: `tools/verify_answers.py`
  - Reads the PR author (your GitHub login) and your changed files.
  - For each submission file, it reads `<hash>:<nonce>` and matches it against the expected token derived from:
    - `sha256(sha256(username) + sha256(correct_answer) + nonce)`
  - Correct answers are provided to CI via a secret JSON (`CORRECT_ANSWERS_JSON`).
  - If the derived token equals your submitted `<hash>`, the check passes; otherwise it fails.

- Commit signature check: `tools/check_commit_signatures.py`
  - Fails if a commit is detected as an unwanted bot-generated merge or otherwise flagged.

- Leaderboard (maintainer utility): `tools/leaderboard.py`
  - Tallies question counts per user and gives small bonus for earlier submissions per question. Outputs `/tmp/scores.json` when run by maintainers.

If a check fails, open the PR “Checks” tab to see which script reported an error and fix your submission (path, username mismatch, or wrong token).

## Tips for success

- Double-check that the folder and filename use your exact GitHub login (case-sensitive where needed), e.g., `submissions/octocat/octocat_q1.txt`.
- Ensure file contents are exactly `<hash>:<nonce>` on one line with no extra spaces or newlines.
- If the UI shows `—` for the hash, it means a token hasn’t been generated; make sure both fields are filled and confirm with Enter.
- You can edit your username/answer via the EDIT buttons and regenerate the token at any time.
- Some questions include media links (video/image) at the top—open them for extra context.
- Click around stuff. Maybe you'd find something.

## FAQ
  - At the top of the terminal area: ▶ Watch video and 🖼 View image links open in a new tab.
- Can I submit without using the UI token?
  - CI requires the token format. If you know your answer is right, still use the UI to produce the correct `<hash>:<nonce>` pair.
