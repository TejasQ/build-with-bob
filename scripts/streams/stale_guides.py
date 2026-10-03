"""List guides in content/topics/ whose `updated` date is older than MAX_AGE_DAYS.

Usage: python3 scripts/streams/stale_guides.py [--oldest]   (one "<slug> <updated>" per line)
--oldest prints only the least recently updated guide, stale or not (used to self-test CI).
"""
import re
import sys
from datetime import date, timedelta
from pathlib import Path

GUIDES = Path("content/topics")
MAX_AGE_DAYS = 30


def stale(today: date | None = None, max_age: int = MAX_AGE_DAYS) -> list[tuple[str, str]]:
    cutoff = (today or date.today()) - timedelta(days=max_age)
    out = []
    for p in sorted(GUIDES.glob("*.md")):
        m = re.search(r"^updated:\s*['\"]?(\d{4}-\d{2}-\d{2})", p.read_text(), re.M)
        if m and date.fromisoformat(m.group(1)) < cutoff:
            out.append((p.stem, m.group(1)))
    return sorted(out, key=lambda g: (g[1], g[0]))


if __name__ == "__main__":
    guides = stale(max_age=-1)[:1] if "--oldest" in sys.argv else stale()
    for slug, updated in guides:
        print(slug, updated)
