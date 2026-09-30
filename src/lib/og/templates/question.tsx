import { Frame } from "../frame";
import { clamp, fit, og } from "../theme";

type Props = { question: string; answer?: string; moments: number; episodes: number };

export function QuestionCard({ question, answer, moments, episodes }: Props) {
  const q = clamp(question, 120);
  return (
    <Frame kind="Answered on the show">
      <div style={{ display: "flex", gap: 36, alignItems: "flex-start", width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 104,
            height: 104,
            flexShrink: 0,
            borderRadius: 28,
            backgroundImage: og.gradient,
            fontSize: 64,
            fontWeight: 700,
          }}
        >
          Q
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>
          <div
            style={{
              display: "flex",
              fontSize: fit(
                q,
                [
                  [40, 64],
                  [70, 54],
                  [100, 46],
                ],
                40,
              ),
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -1.2,
            }}
          >
            {q}
          </div>
          {answer && (
            <div
              style={{
                display: "flex",
                padding: "20px 26px",
                borderRadius: 20,
                border: `1px solid ${og.border}`,
                backgroundColor: "#1f2942cc",
                fontSize: 24,
                lineHeight: 1.45,
                color: "#dce2ef",
              }}
            >
              {clamp(answer, 130)}
            </div>
          )}
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: og.blueLight,
              fontWeight: 600,
            }}
          >
            {`${moments} timestamped moments across ${episodes} ${episodes === 1 ? "source" : "sources"}`}
          </div>
        </div>
      </div>
    </Frame>
  );
}
