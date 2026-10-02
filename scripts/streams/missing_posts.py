"""List registered episodes that have no post in content/episodes/ yet.

Usage: python3 scripts/streams/missing_posts.py   (prints one "<videoId> <title>" per line)
"""
import json
import re
from pathlib import Path

POSTS = Path("content/episodes")


def missing() -> list[dict]:
    written = {
        m.group(1)
        for p in POSTS.glob("*.md")
        if (m := re.search(r"^videoId:\s*['\"]?([\w-]{11})", p.read_text(), re.M))
    }
    episodes = json.loads(Path("data/episodes.json").read_text())
    return [e for e in episodes if e["videoId"] not in written]


if __name__ == "__main__":
    for e in missing():
        print(e["videoId"], e.get("youtubeTitle", ""))
