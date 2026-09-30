import { bobMascot, remoteImage } from "../assets";
import { Frame } from "../frame";
import { Headline } from "../headline";
import { Chips } from "../parts";

type Props = {
  kind: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  chips?: string[];
  /** YouTube video ids for a tilted thumbnail collage on the right. */
  collage?: string[];
  /** Show IBM Bob waving on the right. */
  mascot?: boolean;
};

export async function PageCard({
  kind,
  eyebrow,
  title,
  subtitle,
  chips,
  collage = [],
  mascot,
}: Props) {
  const thumbs = (
    await Promise.all(
      collage
        .slice(0, 3)
        .map((id) => remoteImage(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)),
    )
  ).filter(Boolean) as string[];
  const hasCollage = thumbs.length > 0;
  const side = hasCollage || mascot;
  return (
    <Frame kind={kind}>
      <div style={{ display: "flex", alignItems: "center", width: "100%", gap: 40 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 28, flex: 1 }}>
          <Headline
            eyebrow={eyebrow}
            title={title}
            subtitle={subtitle}
            maxWidth={side ? 640 : 1072}
            big={!side}
          />
          {chips && <Chips items={chips} max={5} />}
        </div>
        {mascot && !hasCollage && (
          // eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img>
          <img
            src={bobMascot}
            width={380}
            height={380}
            style={{ marginRight: -20 }}
            alt=""
          />
        )}
        {hasCollage && (
          <div style={{ display: "flex", position: "relative", width: 400, height: 330 }}>
            {thumbs.map((src, i) => (
              <div
                key={src.slice(-24)}
                style={{
                  display: "flex",
                  position: "absolute",
                  top: i * 70,
                  left: i * 40,
                  padding: 3,
                  borderRadius: 20,
                  backgroundImage: "linear-gradient(107deg, #0f62fe 20%, #a56eff 90%)",
                  transform: `rotate(${(i - 1) * 5}deg)`,
                  boxShadow: "0 24px 60px #00000088",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> */}
                <img
                  src={src}
                  width={320}
                  height={180}
                  style={{ borderRadius: 18, objectFit: "cover" }}
                  alt=""
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Frame>
  );
}
