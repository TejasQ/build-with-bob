import { remoteImage } from "../assets";
import { Frame } from "../frame";
import { Headline } from "../headline";
import { Chips, Play } from "../parts";
import { og } from "../theme";

type Props = {
  number: number;
  project: string;
  part: number;
  title: string;
  date: string;
  duration: string;
  tools: string[];
  videoId: string;
};

export async function EpisodeCard(p: Props) {
  const thumb =
    (await remoteImage(`https://i.ytimg.com/vi/${p.videoId}/maxresdefault.jpg`)) ??
    (await remoteImage(`https://i.ytimg.com/vi/${p.videoId}/hqdefault.jpg`));
  return (
    <Frame kind={`Episode ${p.number}`}>
      <div style={{ display: "flex", alignItems: "center", gap: 48, width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
          <Headline
            eyebrow={`${p.project} · part ${p.part}`}
            title={p.title}
            maxWidth={580}
            compact
          />
          <div style={{ display: "flex", gap: 16, fontSize: 22, color: og.muted }}>
            <div style={{ display: "flex" }}>{p.date}</div>
            <div style={{ display: "flex", color: og.faint }}>•</div>
            <div style={{ display: "flex" }}>{p.duration}</div>
          </div>
          <Chips items={p.tools} max={3} />
        </div>
        {thumb && (
          <div
            style={{
              display: "flex",
              padding: 3,
              borderRadius: 26,
              backgroundImage: og.gradient,
              boxShadow: "0 30px 80px #0f62fe55",
            }}
          >
            <div
              style={{
                display: "flex",
                position: "relative",
                borderRadius: 24,
                overflow: "hidden",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> */}
              <img
                src={thumb}
                width={456}
                height={256}
                style={{ objectFit: "cover" }}
                alt=""
              />
              <div
                style={{
                  position: "absolute",
                  left: 20,
                  bottom: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 18px",
                  borderRadius: 999,
                  backgroundImage: og.gradient,
                  fontSize: 20,
                  fontWeight: 600,
                }}
              >
                <Play />
                Watch · {p.duration}
              </div>
            </div>
          </div>
        )}
      </div>
    </Frame>
  );
}
