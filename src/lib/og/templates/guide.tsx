import { Frame } from "../frame";
import { Headline } from "../headline";
import { Chips } from "../parts";
import { og } from "../theme";

type Props = {
  title: string;
  answer: string;
  episodes: number;
  updated: string;
  about: string[];
};

export function GuideCard({ title, answer, episodes, updated, about }: Props) {
  return (
    <Frame kind="Guide">
      <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
        <Headline
          eyebrow={`First-hand guide · ${episodes} live episodes`}
          title={title}
          subtitle={answer}
          maxWidth={1060}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Chips items={about} max={4} />
          <div style={{ display: "flex", fontSize: 20, color: og.faint }}>
            Updated {updated}
          </div>
        </div>
      </div>
    </Frame>
  );
}
