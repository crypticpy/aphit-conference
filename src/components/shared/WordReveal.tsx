import React from "react";
import { attractConfig } from "../../config";

const { wordReveal } = attractConfig;

export function WordReveal({
  text,
  visible,
  staggerMs = wordReveal.staggerMs,
  style,
}: {
  text: string;
  visible: boolean;
  staggerMs?: number;
  style?: React.CSSProperties;
}) {
  const words = text.split(" ");
  return (
    <span style={{ display: "inline", ...style }}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          style={{
            display: "inline-block",
            overflow: "hidden",
            marginRight: i < words.length - 1 ? "0.3em" : 0,
            verticalAlign: "top",
          }}
        >
          <span
            style={{
              display: "inline-block",
              transform: visible
                ? "translateY(0) scale(1)"
                : "translateY(110%) scale(0.96)",
              opacity: visible ? 1 : 0,
              transition: visible
                ? `transform ${wordReveal.enterTransformMs}ms cubic-bezier(0.16, 1, 0.3, 1) ${i * staggerMs}ms, opacity ${wordReveal.enterOpacityMs}ms ease ${i * staggerMs}ms`
                : `transform ${wordReveal.exitTransformMs}ms ease, opacity ${wordReveal.exitOpacityMs}ms ease`,
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}
