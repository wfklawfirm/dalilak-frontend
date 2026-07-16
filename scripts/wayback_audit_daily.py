#!/usr/bin/env python3
"""
Progressive daily audit of Wayback PDF links in lib/allTransactions.ts.

Internet Archive rate-limits concurrent requests aggressively from this
sandbox's IP (confirmed: 1 serial request succeeds reliably in <1s, but 3+
concurrent requests cause cascading timeouts). So this script checks a small
batch (default 50) SERIALLY, one request at a time, and is meant to be run
once per day via a scheduled task until the whole 794-link corpus is covered.

State (which URLs have been checked, and whether they're REAL or FAKE) is
persisted in scripts/wayback_audit_state.json so each run resumes where the
last one left off.

For any URL confirmed FAKE (i.e. Wayback's own CDX index has no capture for
it), this script does NOT delete data blindly — it just records the finding.
A human (or a follow-up Claude session) should review scripts/wayback_audit_state.json
periodically and decide whether to remove/replace the dead entries in
allTransactions.ts once a full pass is complete, since removing entries
changes indices used elsewhere (_P dict keys reference _R array positions).
"""
import json
import os
import re
import sys
import time
import urllib.request
import urllib.parse

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATE_PATH = os.path.join(BASE_DIR, "scripts", "wayback_audit_state.json")
TX_PATH = os.path.join(BASE_DIR, "lib", "allTransactions.ts")


def load_state():
    with open(STATE_PATH, encoding="utf-8") as f:
        return json.load(f)


def save_state(state):
    with open(STATE_PATH, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)


def extract_all_pdf_urls():
    with open(TX_PATH, encoding="utf-8") as f:
        content = f.read()
    p_section = re.search(
        r"const _P:\{\[k:number\]:string\}=\{(.*?)\n\}", content, re.S
    ).group(1)
    entries = re.findall(r"\d+:'([^']*)'", p_section)
    return entries


def original_url(wayback_url):
    m = re.search(r"/web/\d+id_/(.+)$", wayback_url)
    return m.group(1) if m else None


def check_cdx(orig_url, timeout=15):
    """Query Wayback CDX API for an exact URL. Returns 'REAL', 'FAKE', or 'ERR'."""
    cdx_url = "http://web.archive.org/cdx/search/cdx?url=" + urllib.parse.quote(
        orig_url, safe=":/"
    ) + "&output=json"
    try:
        with urllib.request.urlopen(cdx_url, timeout=timeout) as resp:
            data = json.loads(resp.read().decode("utf-8") or "[]")
        return "REAL" if len(data) > 1 else "FAKE"
    except Exception:
        return "ERR"


def main():
    state = load_state()
    all_urls = extract_all_pdf_urls()
    checked = state.get("checked", {})
    batch_size = state.get("batch_size", 50)

    todo = [u for u in all_urls if checked.get(u) not in ("REAL", "FAKE")]
    print(f"Total links: {len(all_urls)}, already resolved: {len(all_urls) - len(todo)}, "
          f"remaining: {len(todo)}", file=sys.stderr)

    if not todo:
        print("AUDIT COMPLETE — all links have been checked.", file=sys.stderr)
        real = sum(1 for v in checked.values() if v == "REAL")
        fake = sum(1 for v in checked.values() if v == "FAKE")
        print(f"Final tally: {real} REAL, {fake} FAKE out of {len(checked)} checked.",
              file=sys.stderr)
        return

    batch = todo[:batch_size]
    for i, wb_url in enumerate(batch):
        orig = original_url(wb_url)
        if not orig:
            checked[wb_url] = "ERR"
        else:
            status = check_cdx(orig)
            checked[wb_url] = status
            print(f"[{i+1}/{len(batch)}] {status}  {wb_url}", file=sys.stderr)
        # Save after every single check so a timeout/interruption never loses
        # progress — each run (even a partial one) is fully durable.
        state["checked"] = checked
        state["last_run"] = time.strftime("%Y-%m-%d %H:%M:%S")
        save_state(state)
        # Serial with a small pause — concurrency (even 3-5 parallel) triggers
        # Internet Archive's rate limiter for this environment; a plain serial
        # loop with ~0.3s spacing has been reliable in testing.
        time.sleep(0.3)

    real = sum(1 for v in checked.values() if v == "REAL")
    fake = sum(1 for v in checked.values() if v == "FAKE")
    err = sum(1 for v in checked.values() if v == "ERR")
    remaining = len(all_urls) - len(checked)
    print(f"\nProgress: {len(checked)}/{len(all_urls)} checked "
          f"({real} REAL, {fake} FAKE, {err} ERR-will-retry). "
          f"{remaining} remaining.", file=sys.stderr)


if __name__ == "__main__":
    main()
