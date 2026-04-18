import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

export function SettingsFlyout({ open, onClose }) {
  const { theme, setTheme } = useTheme();
  const panelRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    if (open) setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 200,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '320px',
          backgroundColor: 'var(--color-canvas-default)',
          borderLeft: '1px solid var(--color-border-default)',
          boxShadow: 'var(--color-shadow-large)',
          zIndex: 201,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border-default)',
        }}>
          <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-fg-default)' }}>
            ⚙️ Settings
          </span>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              color: 'var(--color-fg-muted)',
              lineHeight: 1,
              padding: '4px',
            }}
            title="Close"
          >✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          {/* Theme toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-canvas-subtle)',
            border: '1px solid var(--color-border-default)',
          }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-fg-default)' }}>
              Theme
            </span>
            <ThemeToggle theme={theme} onChange={setTheme} />
          </div>
        </div>
      </div>
    </>
  );
}

function ThemeToggle({ theme, onChange }) {
  const isDark = theme === 'dark';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{
        fontSize: '12px',
        fontWeight: isDark ? 400 : 600,
        color: isDark ? 'var(--color-fg-muted)' : 'var(--color-fg-default)',
        transition: 'color 0.2s',
      }}>
        ☀️ Light
      </span>

      {/* Toggle track */}
      <button
        role="switch"
        aria-checked={isDark}
        onClick={() => onChange(isDark ? 'light' : 'dark')}
        style={{
          width: '44px',
          height: '24px',
          borderRadius: '12px',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: isDark ? 'var(--color-accent-emphasis)' : 'var(--color-border-default)',
          position: 'relative',
          padding: 0,
          transition: 'background-color 0.2s ease',
          flexShrink: 0,
        }}
      >
        {/* Thumb */}
        <span style={{
          position: 'absolute',
          top: '3px',
          left: isDark ? '23px' : '3px',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          transition: 'left 0.2s ease',
          display: 'block',
        }} />
      </button>

      <span style={{
        fontSize: '12px',
        fontWeight: isDark ? 600 : 400,
        color: isDark ? 'var(--color-fg-default)' : 'var(--color-fg-muted)',
        transition: 'color 0.2s',
      }}>
        🌙 Dark
      </span>
    </div>
  );
}
