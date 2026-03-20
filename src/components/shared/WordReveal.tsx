import React from 'react';

export function WordReveal({ text, visible, staggerMs = 50, style }: {
  text: string; visible: boolean; staggerMs?: number; style?: React.CSSProperties;
}) {
  const words = text.split(' ');
  return (
    <span style={{ display: 'inline', ...style }}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            marginRight: i < words.length - 1 ? '0.3em' : 0,
            verticalAlign: 'top',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              transform: visible ? 'translateY(0)' : 'translateY(110%)',
              opacity: visible ? 1 : 0,
              transition: `transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * staggerMs}ms, opacity 0.4s ease ${i * staggerMs}ms`,
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}
