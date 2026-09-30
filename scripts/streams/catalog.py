"""data/episodes.json: the source of truth for which videos are episodes, their slug and project."""
import json
import re
from pathlib import Path

EPISODES = Path("data/episodes.json")
SHOW_TITLE = re.compile(r"build(ing)?\s+with\s+bob", re.I)
FIXES = {
    "Wallfly": "Walfly",
    "Docling SAS": "Docling SaaS",
    "Build with Bob": "Building with Bob",
    "Killer Context": "KillrCtx",
}


def load() -> list[dict]:
    return json.loads(EPISODES.read_text()) if EPISODES.exists() else []


def save(episodes: list[dict]) -> None:
    episodes.sort(key=lambda e: e["date"])
    parts: dict[str, int] = {}
    for i, e in enumerate(episodes, 1):
        e["number"] = i  # global, chronological
        parts[e["project"]] = parts.get(e["project"], 0) + 1
        e["part"] = parts[e["project"]]  # position within its project
    EPISODES.write_text(json.dumps(episodes, indent=2, ensure_ascii=False) + "\n")


def fix(text: str) -> str:
    for wrong, right in FIXES.items():
        text = text.replace(wrong, right)
    return text


def entry_from_info(info: dict, slug: str, project: str) -> dict:
    d = info["upload_date"]
    chapters = [
        {"start": int(c["start_time"]), "title": "Intro" if c["title"].startswith("<Untitled") else fix(c["title"])}
        for c in info.get("chapters") or []
    ]
    return {
        "videoId": info["id"], "slug": slug, "project": project,
        "youtubeTitle": info["title"], "date": f"{d[:4]}-{d[4:6]}-{d[6:]}",
        "duration": info["duration"], "thumbnail": f"https://i.ytimg.com/vi/{info['id']}/maxresdefault.jpg",
        "youtubeDescription": info.get("description", ""), "chapters": chapters,
    }
