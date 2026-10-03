"""List guides in content/topics/ whose `updated` date is older than MAX_AGE_DAYS.

Usage: python3 scripts/streams/stale_guides.py   (prints one "<slug> <updated>" per line)
"""
import re
from datetime import date, timedelta
from pathlib import Path

GUIDES = Path("content/topics")
MAX_AGE_DAYS = 30


def stale(today: date | None = None) -> list[tuple[str, str]]:
    cutoff = (today or date.today()) - timedelta(days=MAX_AGE_DAYS)
    out = []
    for p in sorted(GUIDES.glob("*.md")):
        m = re.search(r"^updated:\s*['\"]?(\d{4}-\d{2}-\d{2})", p.read_text(), re.M)
        if m and date.fromisoformat(m.group(1)) < cutoff:
            out.append((p.stem, m.group(1)))
    return out


if __name__ == "__main__":
    for slug, updated in stale():
        print(slug, updated)
