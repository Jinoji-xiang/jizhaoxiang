"""
Check GitHub Actions deploy status for a specific commit.
Usage: python check_deploy.py <commit_sha_short>
"""
import json
import sys
import urllib.request

REPO = "Jinoji-xiang/jizhaoxiang"

def main():
    target = sys.argv[1] if len(sys.argv) > 1 else "5f7ca0d"
    url = f"https://api.github.com/repos/{REPO}/actions/runs?per_page=5"
    req = urllib.request.Request(url, headers={"User-Agent": "audit-bot"})
    with urllib.request.urlopen(req, timeout=15) as r:
        data = json.load(r)

    runs = data.get("workflow_runs", [])
    if not runs:
        print("No workflow runs found")
        return 1

    found = None
    for run in runs:
        sha = (run.get("head_sha") or "")[:7]
        if sha == target[:7]:
            found = run
            break

    if not found:
        print(f"Commit {target} not found in recent runs. Latest 3:")
        for r in runs[:3]:
            print(f"  {r['head_sha'][:7]}  {r['status']:12s}  {r.get('conclusion') or '-':10s}  {r['display_title']}")
        return 0

    status = found["status"]
    conclusion = found.get("conclusion")
    title = found["display_title"]
    url_run = found["html_url"]
    print(f"Commit:   {found['head_sha'][:7]}")
    print(f"Status:   {status}")
    print(f"Result:   {conclusion or '-'}")
    print(f"Title:    {title}")
    print(f"URL:      {url_run}")

    if status == "completed" and conclusion == "success":
        print("\n[DEPLOYED] GitHub Pages deploy succeeded.")
        return 0
    if status == "completed" and conclusion == "failure":
        print("\n[FAILED] Check the URL for error logs.")
        return 2
    print(f"\n[IN_PROGRESS] still {status}...")
    return 0

if __name__ == "__main__":
    sys.exit(main())
