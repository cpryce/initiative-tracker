import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function SessionsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sessions', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => { setSessions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const createSession = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: newName.trim() }),
    });
    const session = await res.json();
    setSessions((prev) => [...prev, session]);
    setNewName('');
    setCreating(false);
  };

  const deleteSession = async (id) => {
    if (!confirm('Delete this encounter session?')) return;
    await fetch(`/api/sessions/${id}`, { method: 'DELETE', credentials: 'include' });
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#24292f',
        borderBottom: '1px solid #444c56',
        padding: '0 24px',
      }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between h-14">
          <span className="font-semibold text-base" style={{ color: '#ffffff' }}>
            ⚔️ Initiative Tracker
          </span>
          <div className="flex items-center gap-3">
            {user?.avatar && (
              <img src={user.avatar} alt="" className="w-7 h-7 rounded-full" />
            )}
            <span className="text-sm" style={{ color: '#adbac7' }}>{user?.displayName}</span>
            <button
              onClick={logout}
              className="text-sm px-3 py-1 rounded-md"
              style={{
                color: '#adbac7',
                border: '1px solid #444c56',
                backgroundColor: 'transparent',
                cursor: 'pointer',
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-fg-default)' }}>
          Encounter Sessions
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-fg-muted)' }}>
          Create and manage your D&amp;D 3.5e combat encounters.
        </p>

        {/* Create form */}
        <form onSubmit={createSession} className="flex gap-2 mb-8">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New encounter name..."
            className="flex-1 px-3 py-2 rounded-md text-sm"
            style={{
              backgroundColor: 'var(--color-canvas-default)',
              border: '1px solid var(--color-border-default)',
              color: 'var(--color-fg-default)',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="px-4 py-2 rounded-md text-sm font-medium"
            style={{
              backgroundColor: 'var(--color-accent-emphasis)',
              color: '#ffffff',
              border: 'none',
              cursor: creating ? 'not-allowed' : 'pointer',
              opacity: creating ? 0.7 : 1,
            }}
          >
            Create Session
          </button>
        </form>

        {loading ? (
          <p style={{ color: 'var(--color-fg-muted)' }}>Loading sessions…</p>
        ) : sessions.length === 0 ? (
          <div
            className="text-center py-16 rounded-xl"
            style={{
              backgroundColor: 'var(--color-canvas-default)',
              border: '1px solid var(--color-border-default)',
            }}
          >
            <p style={{ color: 'var(--color-fg-muted)' }}>No encounter sessions yet.</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-fg-subtle)' }}>
              Create your first encounter above.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {sessions.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors"
                style={{
                  backgroundColor: 'var(--color-canvas-default)',
                  border: '1px solid var(--color-border-default)',
                  boxShadow: 'var(--color-shadow-medium)',
                }}
                onClick={() => navigate(`/encounter/${s.id}`)}
              >
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--color-fg-default)' }}>
                    {s.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-fg-muted)' }}>
                    {s.combatants?.length ?? 0} combatants · Round {s.round}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    color: 'var(--color-danger-fg)',
                    border: '1px solid var(--color-border-muted)',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
