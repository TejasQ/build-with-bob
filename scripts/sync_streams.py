"""Keep the show fresh: find new Building with Bob streams on the IBM Bob channel,
download their captions + metadata, write transcripts, and register them in
data/episodes.json with a provisional slug/project. Prints a JSON report of what's new.
Streams whose captions YouTube hasn't generated yet are reported as "pending" and picked up
on a later run.

Usage: python3 scripts/sync_streams.py [--rebuild]   (--rebuild re-derives every entry)
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from streams import catalog, transcript, youtube  # noqa: E402

RAW = Path("data/raw")


def provisional_slug(title: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:80]


def main() -> None:
    episodes = catalog.load()
    known = {e["videoId"]: e for e in episodes}
    if "--rebuild" in sys.argv:
        for e in episodes:
            info = json.loads((RAW / f"{e['videoId']}.info.json").read_text())
            known[e["videoId"]] = catalog.entry_from_info(info, e["slug"], e["project"])
            transcript.write(e["videoId"], RAW)
    streams = [s for s in youtube.list_streams() if catalog.SHOW_TITLE.search(s["title"])]
    new, pending, failed = [], [], []
    for s in streams:
        if s["id"] in known:
            continue
        status, reason = youtube.fetch_video(s["id"], RAW)
        if status != "ok":
            (pending if status == "pending" else failed).append({**s, "reason": reason})
            continue
        info = json.loads((RAW / f"{s['id']}.info.json").read_text())
        known[s["id"]] = catalog.entry_from_info(info, provisional_slug(info["title"]), "unassigned")
        transcript.write(s["id"], RAW)
        new.append({"videoId": s["id"], "title": info["title"]})
    catalog.save(list(known.values()))
    print(json.dumps({"checked": len(streams), "new": new, "pending": pending, "failed": failed}, indent=2))


if __name__ == "__main__":
    main()
