import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserMenu } from '../components/UserMenu';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>
      <header style={{ backgroundColor: '#24292f', borderBottom: '1px solid #444c56', padding: '0 24px' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              style={{ color: '#adbac7', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px' }}
              title="Back"
            >←</button>
            <span className="font-semibold text-base" style={{ color: '#ffffff' }}>⚔️ Initiative Tracker</span>
          </div>
          <UserMenu user={user} onLogout={logout} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-fg-default)' }}>
          Settings
        </h2>
        <div
          className="p-6 rounded-lg text-center"
          style={{
            backgroundColor: 'var(--color-canvas-default)',
            border: '1px solid var(--color-border-default)',
            color: 'var(--color-fg-muted)',
          }}
        >
          Settings coming soon.
        </div>
      </main>
    </div>
  );
}
