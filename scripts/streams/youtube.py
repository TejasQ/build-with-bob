"""Thin wrappers around yt-dlp (run via uvx so no global install is needed)."""
import json
import subprocess
from pathlib import Path

CHANNEL_STREAMS = "https://www.youtube.com/@ibm-bob/streams"
YTDLP = ["uvx", "--with", "curl_cffi", "yt-dlp", "--impersonate", "chrome"]


def list_streams(url: str = CHANNEL_STREAMS) -> list[dict]:
    """Flat list of the channel's past/live streams: [{id, title}]."""
    out = subprocess.run(
        [*YTDLP, "--flat-playlist", "-J", url], capture_output=True, text=True, check=True
    ).stdout
    return [{"id": e["id"], "title": e.get("title", "")} for e in json.loads(out).get("entries", [])]


def fetch_video(video_id: str, raw_dir: Path, retries: int = 3) -> bool:
    """Download info.json + English auto-captions (json3). Returns True when both exist."""
    raw_dir.mkdir(parents=True, exist_ok=True)
    for _ in range(retries):
        subprocess.run(
            [*YTDLP, "--skip-download", "--write-info-json", "--write-auto-subs",
             "--sub-langs", "en-orig", "--sub-format", "json3", "--sleep-subtitles", "4",
             "-o", str(raw_dir / "%(id)s.%(ext)s"), f"https://www.youtube.com/watch?v={video_id}"],
            capture_output=True, text=True,
        )
        if (raw_dir / f"{video_id}.info.json").exists() and (raw_dir / f"{video_id}.en-orig.json3").exists():
            return True
    return False
