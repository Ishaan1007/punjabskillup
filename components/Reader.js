"use client";
import { COLORS } from "../lib/constants";

export default function Reader({ topicTitle, breadcrumb, blocks }) {
  if (!topicTitle) {
    return (
      <div style={{ padding: "80px 24px", textAlign: "center", color: "#8A8F99" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
          [ this course has no topics yet ]
        </div>
      </div>
    );
  }
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 28px 80px" }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#0E7FD1", marginBottom: 14 }}>
        {breadcrumb.join(" / ")}
      </div>
      {(!blocks || blocks.length === 0) && (
        <div style={{ color: "#8A8F99", fontSize: 14 }}>No notes have been added for this topic yet.</div>
      )}
      {blocks &&
        blocks.map((b) => {
          if (b.type === "code") {
            const lines = (b.text || "").split("\n");
            return (
              <div key={b.id} className="code-block">
                <div className="code-gutter">
                  {lines.map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <pre className="code-content">{b.text || " "}</pre>
              </div>
            );
          }
          const tag = b.type === "h1" ? "h1" : b.type === "h2" ? "h2" : b.type === "h3" ? "h3" : "p";
          const sizes = { h1: 26, h2: 20, h3: 16, p: 15 };
          const Tag = tag;
          return (
            <Tag
              key={b.id}
              style={{
                fontFamily: tag === "p" ? "'Inter', sans-serif" : "'Space Grotesk', sans-serif",
                fontWeight: tag === "p" ? 400 : 600,
                fontSize: sizes[tag],
                color: COLORS[b.color] || COLORS.black,
                lineHeight: 1.65,
                margin: tag === "p" ? "0 0 16px" : "28px 0 10px",
              }}
            >
              {b.text}
            </Tag>
          );
        })}
    </div>
  );
}
