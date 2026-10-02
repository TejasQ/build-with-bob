"""Thin wrappers around yt-dlp (run via uvx so no global install is needed)."""
import json
import os
import subprocess
from pathlib import Path

CHANNEL_STREAMS = "https://www.youtube.com/@ibm-bob/streams"
YTDLP = ["uvx", "--from", "yt-dlp[default,curl-cffi]", "yt-dlp", "--impersonate", "chrome"]
# Optional Netscape cookies file (CI writes it from the YT_COOKIES secret) to get past bot checks.
if os.environ.get("YT_COOKIES_FILE"):
    YTDLP += ["--cookies", os.environ["YT_COOKIES_FILE"]]


def list_streams(url: str = CHANNEL_STREAMS) -> list[dict]:
    """Flat list of the channel's past/live streams: [{id, title}]."""
    out = subprocess.run(
        [*YTDLP, "--flat-playlist", "-J", url], capture_output=True, text=True, check=True
    ).stdout
    return [{"id": e["id"], "title": e.get("title", "")} for e in json.loads(out).get("entries", [])]


def fetch_video(video_id: str, raw_dir: Path, retries: int = 3) -> tuple[str, str]:
    """Download info.json + English auto-captions (json3).

    Returns (status, reason). status is "ok" when both exist, "pending" when YouTube has the video but no captions yet
    (live, upcoming, or a just-ended stream still processing; retried on the next sync), or
    "failed" when even the metadata could not be fetched.
    """
    raw_dir.mkdir(parents=True, exist_ok=True)
    info, subs = raw_dir / f"{video_id}.info.json", raw_dir / f"{video_id}.en-orig.json3"
    for _ in range(retries):
        run = subprocess.run(
            [*YTDLP, "--skip-download", "--write-info-json", "--write-auto-subs",
             "--sub-langs", "en-orig", "--sub-format", "json3", "--sleep-subtitles", "4",
             "-o", str(raw_dir / "%(id)s.%(ext)s"), f"https://www.youtube.com/watch?v={video_id}"],
            capture_output=True, text=True,
        )
        if info.exists() and subs.exists():
            return "ok", ""
        if info.exists() and not json.loads(info.read_text()).get("automatic_captions"):
            return "pending", "YouTube has not generated captions yet"
    errors = [ln for ln in run.stderr.splitlines() if "ERROR" in ln]
    return "failed", (errors or run.stderr.strip().splitlines() or ["no output"])[-1]
