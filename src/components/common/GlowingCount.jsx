import React from 'react';

export const GlowingCount = ({ count, color = '#38bdf8', isDark = true }) => {
  if (count === undefined || count === null) return null;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        marginLeft: 8,
        fontSize: 12,
        fontWeight: 700,
        color: isDark ? '#f8fafc' : '#1e293b',
        background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
        padding: '2px 8px',
        borderRadius: 12,
        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
        lineHeight: 1
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: 7,
          height: 7,
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: `0 0 6px ${color}, 0 0 10px ${color}`
        }}
      />
      <span>{count}</span>
    </span>
  );
};
