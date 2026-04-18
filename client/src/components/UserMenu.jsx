import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export function UserMenu({ user, onLogout, onSettingsOpen }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const go = (path) => { setOpen(false); navigate(path); };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'transparent',
          border: '1px solid var(--color-header-border)',
          borderRadius: '6px',
          padding: '4px 10px',
          cursor: 'pointer',
          color: 'var(--color-header-muted)',
        }}
      >
        {user?.avatar
          ? <img src={user.avatar} alt="" style={{ width: '22px', height: '22px', borderRadius: '50%' }} />
          : <span style={{ fontSize: '18px' }}>👤</span>
        }
        <span style={{ fontSize: '13px' }}>{user?.displayName}</span>
        <span style={{ fontSize: '10px', opacity: 0.6 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 'calc(100% + 8px)',
          width: '168px',
          backgroundColor: 'var(--color-canvas-default)',
          border: '1px solid var(--color-border-default)',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 100,
          overflow: 'hidden',
          padding: '4px 0',
        }}>
          <MenuItem onClick={() => go('/sessions')}>📋 Sessions</MenuItem>
          <MenuItem onClick={() => { setOpen(false); onSettingsOpen?.(); }}>⚙️ Settings</MenuItem>
          <div style={{ borderTop: '1px solid var(--color-border-default)', margin: '4px 0' }} />
          <MenuItem onClick={() => { setOpen(false); onLogout(); }}>Sign out</MenuItem>
        </div>
      )}
    </div>
  );
}

function MenuItem({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        backgroundColor: 'transparent',
        border: 'none',
        padding: '8px 16px',
        fontSize: '13px',
        color: 'var(--color-fg-default)',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-canvas-subtle)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      {children}
    </button>
  );
}
