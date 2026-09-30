"""yt-dlp json3 captions -> timestamped ~30s paragraphs (data/transcripts/<id>.{json,txt})."""
import json
import re
from pathlib import Path

OUT = Path("data/transcripts")


def _words(path: Path):
    for ev in json.loads(path.read_text()).get("events", []):
        base = ev.get("tStartMs", 0)
        for i, s in enumerate(ev.get("segs") or []):
            t = s.get("utf8", "").replace("\n", " ")
            if t.strip():
                yield (base + s.get("tOffsetMs", 0)) / 1000, (" " + t if i == 0 else t)


def _clean(text: str) -> str:
    text = re.sub(r"\[(laughter|music|applause|snorts)\]", "", text, flags=re.I)
    text = re.sub(r"\s*>>\s*", " — ", text)
    return re.sub(r"\s+", " ", text).strip(" —")


def paragraphs(path: Path, window: int = 30) -> list[dict]:
    paras, cur, start = [], [], None
    for t, w in _words(path):
        start = t if start is None else start
        cur.append(w)
        ended = re.search(r"[.?!]\s*$", "".join(cur))
        if (t - start >= window and ended) or t - start >= window * 2:
            paras.append({"start": int(start), "text": _clean("".join(cur))})
            cur, start = [], None
    if cur:
        paras.append({"start": int(start), "text": _clean("".join(cur))})
    return paras


def ts(s: int) -> str:
    return f"{s // 3600}:{s % 3600 // 60:02d}:{s % 60:02d}"


def write(video_id: str, raw_dir: Path) -> int:
    paras = paragraphs(raw_dir / f"{video_id}.en-orig.json3")
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / f"{video_id}.json").write_text(json.dumps(paras, indent=0))
    (OUT / f"{video_id}.txt").write_text("".join(f"[{ts(p['start'])}] {p['text']}\n" for p in paras))
    return len(paras)
