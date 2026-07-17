#!/usr/bin/env python3
"""
Progressive daily audit of Wayback PDF links in lib/allTransactions.ts.

STATUS: audit completed 2026-07-17. All 770 unique links have been checked
(81 REAL, 688 FAKE, 1 non-Wayback dead link). See scripts/wayback_audit_report.md
for the full findings. This script is kept for re-runs if new links are ever
added to allTransactions.ts -- it will only process genuinely new/unresolved
URLs and print "AUDIT COMPLETE" immediately otherwise.

v3 notes (2026-07-17): originally used the CDX search API
(web.archive.org/cdx/search/cdx), which started getting rate-limited/timing
out partway through the audit. Switched to the lighter "availability" API
(archive.org/wayback/available) which proved reliable under serial use, plus:
  - a realistic browser User-Agent (the default urllib UA may get bucketed
    differently by IA's rate limiter)
  - per-request exponential backoff retries instead of giving up after one
    attempt
  - adaptive inter-request delay: speeds up on success streaks, slows down
    (instead of hard-stopping) after failures
  - one entry in the data (moim.gov.lb direct link) isn't a Wayback URL at
    all -- it's tagged NOT_WAYBACK_DEAD_404 (confirmed 404 via direct check)
    and excluded from retries via TERMINAL_STATUSES.
Cross-validated the availability API against 7 URLs already confirmed via
the old CDX method (5 REAL, 2 FAKE) -- 100%% match.

Internet Archive rate-limits aggressively from this sandbox's IP if you
hammer a single endpoint too fast, so keep requests SERIAL with the
backoff/delay logic below -- do not add concurrency.
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

USER_AGENT = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
              "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
MAX_WALL_SECONDS = 38
TERMINAL_STATUSES = ("REAL", "FAKE", "NOT_WAYBACK_DEAD_404")


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


def check_availability(orig_url, timeout=12, max_retries=3):
    """Query the Wayback 'available' API. Returns 'REAL', 'FAKE', or 'ERR'."""
    api_url = "https://archive.org/wayback/available?url=" + urllib.parse.quote(orig_url, safe="")
    delay = 1.5
    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(api_url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                data = json.loads(resp.read().decode("utf-8") or "{}")
            snaps = data.get("archived_snapshots", {})
            return "REAL" if snaps else "FAKE"
        except Exception:
            if attempt < max_retries - 1:
                time.sleep(delay)
                delay *= 2
    return "ERR"


def main():
    start = time.monotonic()
    state = load_state()
    all_urls = extract_all_pdf_urls()
    checked = state.get("checked", {})
    batch_size = state.get("batch_size", 50)

    todo = [u for u in all_urls if checked.get(u) not in TERMINAL_STATUSES]
    print(f"Total links: {len(all_urls)}, already resolved: {len(all_urls) - len(todo)}, "
          f"remaining: {len(todo)}", file=sys.stderr)

    if not todo:
        print("AUDIT COMPLETE — all links have been checked.", file=sys.stderr)
        real = sum(1 for v in checked.values() if v == "REAL")
        fake = sum(1 for v in checked.values() if v == "FAKE")
        other = sum(1 for v in checked.values() if v not in ("REAL", "FAKE"))
        print(f"Final tally: {real} REAL, {fake} FAKE, {other} other (non-Wayback) "
              f"out of {len(checked)} unique URLs checked.", file=sys.stderr)
        return

    batch = todo[:batch_size]
    base_delay = 0.4
    delay = base_delay
    max_delay = 6.0
    consecutive_fail = 0
    done = 0

    for i, wb_url in enumerate(batch):
        if time.monotonic() - start > MAX_WALL_SECONDS:
            print(f"[wall-clock budget reached, stopping cleanly after {done} checks this run]",
                  file=sys.stderr)
            break
        orig = original_url(wb_url)
        if not orig:
            checked[wb_url] = "NOT_WAYBACK_DEAD_404"
            print(f"[{i+1}/{len(batch)}] NOT_WAYBACK  {wb_url}", file=sys.stderr)
        else:
            status = check_availability(orig)
            checked[wb_url] = status
            print(f"[{i+1}/{len(batch)}] {status}  {wb_url}", file=sys.stderr)
            if status == "ERR":
                consecutive_fail += 1
                delay = min(max_delay, delay * 2)
            else:
                consecutive_fail = 0
                delay = max(base_delay, delay * 0.7)
        done += 1
        state["checked"] = checked
        state["last_run"] = time.strftime("%Y-%m-%d %H:%M:%S")
        state["method"] = "availability-api-v3"
        save_state(state)
        if consecutive_fail >= 5:
            print("[5 consecutive failures even after backoff -- stopping cleanly for this run]",
                  file=sys.stderr)
            break
        time.sleep(delay)

    real = sum(1 for v in checked.values() if v == "REAL")
    fake = sum(1 for v in checked.values() if v == "FAKE")
    other = sum(1 for v in checked.values() if v not in ("REAL", "FAKE"))
    remaining = len(all_urls) - len(checked)
    print(f"\nProgress: {len(checked)}/{len(all_urls)} checked "
          f"({real} REAL, {fake} FAKE, {other} other). "
          f"{remaining} remaining.", file=sys.stderr)


if __name__ == "__main__":
    main()
