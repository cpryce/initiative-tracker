export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>
      <div
        className="w-full max-w-sm p-8 rounded-xl text-center"
        style={{
          backgroundColor: 'var(--color-canvas-default)',
          border: '1px solid var(--color-border-default)',
          boxShadow: 'var(--color-shadow-large)',
        }}
      >
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-1"
            style={{ color: 'var(--color-fg-default)' }}>
            Initiative Tracker
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>
            D&amp;D 3.5e combat initiative manager
          </p>
        </div>

        <div className="mb-6">
          <svg className="mx-auto" width="80" height="80" viewBox="0 0 64 64" aria-label="Initiative Tracker">
            {/* Sword 1: top-left to bottom-right */}
            <g transform="rotate(45 32 32)">
              <rect x="30" y="4" width="4" height="36" rx="1" fill="var(--color-fg-default)"/>
              <rect x="22" y="37" width="20" height="4" rx="2" fill="var(--color-fg-muted)"/>
              <rect x="30.5" y="41" width="3" height="10" rx="1.5" fill="var(--color-fg-muted)"/>
              <circle cx="32" cy="53" r="3" fill="var(--color-fg-muted)"/>
              <polygon points="32,4 30,10 34,10" fill="var(--color-fg-default)"/>
            </g>
            {/* Sword 2: top-right to bottom-left */}
            <g transform="rotate(-45 32 32)">
              <rect x="30" y="4" width="4" height="36" rx="1" fill="var(--color-fg-default)"/>
              <rect x="22" y="37" width="20" height="4" rx="2" fill="var(--color-fg-muted)"/>
              <rect x="30.5" y="41" width="3" height="10" rx="1.5" fill="var(--color-fg-muted)"/>
              <circle cx="32" cy="53" r="3" fill="var(--color-fg-muted)"/>
              <polygon points="32,4 30,10 34,10" fill="var(--color-fg-default)"/>
            </g>
          </svg>
        </div>

        <a
          href="/auth/google"
          className="flex items-center justify-center gap-3 w-full px-4 py-2 rounded-md text-sm font-medium transition-colors"
          style={{
            backgroundColor: 'var(--color-canvas-default)',
            color: 'var(--color-fg-default)',
            border: '1px solid var(--color-border-default)',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-canvas-subtle)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-canvas-default)'}
        >
          <GoogleIcon />
          Sign in with Google
        </a>

        <p className="mt-4 text-xs" style={{ color: 'var(--color-fg-subtle)' }}>
          Sign in to manage your encounter sessions
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}
