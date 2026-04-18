import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoginPage } from './pages/LoginPage';
import { SessionsPage } from './pages/SessionsPage';
import { EncounterPage } from './pages/EncounterPage';
import { SettingsFlyout } from './components/SettingsFlyout';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>
        <p style={{ color: 'var(--color-fg-muted)' }}>Loading…</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function HomePage() {
  const navigate = useNavigate();
  useEffect(() => {
    fetch('/api/sessions', { credentials: 'include' })
      .then((r) => r.json())
      .then((sessions) => {
        if (Array.isArray(sessions) && sessions.length > 0) {
          navigate(`/encounter/${sessions[0].id}`, { replace: true });
        } else {
          navigate('/sessions', { replace: true });
        }
      })
      .catch(() => navigate('/sessions', { replace: true }));
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>
      <p style={{ color: 'var(--color-fg-muted)' }}>Loading…</p>
    </div>
  );
}

function AppRoutes({ onSettingsOpen }) {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/sessions" element={<ProtectedRoute><SessionsPage onSettingsOpen={onSettingsOpen} /></ProtectedRoute>} />
      <Route path="/encounter/:id" element={<ProtectedRoute><EncounterPage onSettingsOpen={onSettingsOpen} /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes onSettingsOpen={() => setSettingsOpen(true)} />
          <SettingsFlyout open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
