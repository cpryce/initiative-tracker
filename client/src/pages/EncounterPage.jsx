import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CombatantCard } from '../components/CombatantCard';
import { UserMenu } from '../components/UserMenu';
import { useAuth } from '../context/AuthContext';

let _idCounter = 1;
function newId() { return `c-${Date.now()}-${_idCounter++}`; }

export function EncounterPage({ onSettingsOpen }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [session, setSession] = useState(null);
  const [editName, setEditName] = useState('');
  const [combatants, setCombatants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [round, setRound] = useState(1);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Load session — initialise players with initiative=0; NPCs not persisted
  useEffect(() => {
    fetch(`/api/sessions/${id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        setSession(data);
        setEditName(data.name);
        const initialCombatants = (data.players || []).map((p) => ({
          ...p,
          initiative: 0,
          modifier: 0,
          flatFooted: false,
        }));
        setCombatants(initialCombatants);
        setRound(1);
        setActiveIndex(0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // Persists only the PC roster — called when PCs are added, removed, or renamed
  const savePlayers = useCallback(async (allCombatants) => {
    const players = allCombatants
      .filter((c) => c.type === 'player')
      .map(({ id: cid, name, type }) => ({ id: cid, name, type }));
    setSaving(true);
    try {
      await fetch(`/api/sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ players }),
      });
    } finally {
      setSaving(false);
    }
  }, [id]);

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    setCombatants((prev) => {
      const oldIndex = prev.findIndex((c) => c.id === active.id);
      const newIndex = prev.findIndex((c) => c.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const sortByInitiative = () => {
    setCombatants((prev) =>
      [...prev].sort((a, b) => {
        const totalA = Math.max(1, a.initiative + a.modifier);
        const totalB = Math.max(1, b.initiative + b.modifier);
        const diff = totalB - totalA;
        return diff !== 0 ? diff : b.modifier - a.modifier;
      })
    );
    setActiveIndex(0);
  };

  const [focusId, setFocusId] = useState(null);

  const saveSessionName = async (name) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === session?.name) {
      setEditName(session?.name ?? '');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      setSession(data);
      setEditName(data.name);
    } finally {
      setSaving(false);
    }
  };

  const addCombatant = (type) => {
    const c = { id: newId(), name: type === 'npc' ? 'NPC' : 'Player', type, initiative: 0, modifier: 0, flatFooted: false };
    setCombatants((prev) => {
      const next = [...prev, c];
      if (type === 'player') savePlayers(next);   // Only save PC adds
      return next;
    });
    setFocusId(c.id);
  };

  const updateCombatant = (updated) => {
    setCombatants((prev) => {
      const old = prev.find((c) => c.id === updated.id);
      const next = prev.map((c) => (c.id === updated.id ? updated : c));
      // Save if a PC name changed (roster update)
      if (old?.type === 'player' && old?.name !== updated.name) savePlayers(next);
      return next;
    });
  };

  const deleteCombatant = (cid) => {
    setCombatants((prev) => {
      const deleted = prev.find((c) => c.id === cid);
      const next = prev.filter((c) => c.id !== cid);
      if (deleted?.type === 'player') savePlayers(next);  // Only save PC deletes
      return next;
    });
  };

  const nextTurn = () => {
    if (combatants.length === 0) return;
    const next = activeIndex + 1;
    if (next >= combatants.length) {
      setRound((r) => r + 1);
      setCombatants((prev) => prev.map((c) => ({ ...c, flatFooted: false })));
      setActiveIndex(0);
    } else {
      setActiveIndex(next);
    }
  };

  const prevTurn = () => setActiveIndex((prev) => Math.max(0, prev - 1));

  const resetRound = () => { setActiveIndex(0); setRound(1); };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>
        <p style={{ color: 'var(--color-fg-muted)' }}>Loading encounter…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>
      <header style={{
        backgroundColor: 'var(--color-header-bg)',
        borderBottom: '1px solid var(--color-header-border)',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/sessions')}
              style={{ color: 'var(--color-header-muted)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px' }}
              title="All sessions"
            >←</button>
            <span className="font-semibold text-base" style={{ color: 'var(--color-header-text)' }}>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onFocus={(e) => e.target.select()}
                onBlur={(e) => saveSessionName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') { setEditName(session?.name ?? ''); e.target.blur(); } }}
                style={{
                  background: 'transparent',
                  border: '1px solid transparent',
                  borderRadius: '4px',
                  color: 'var(--color-header-text)',
                  fontWeight: 600,
                  fontSize: '14px',
                  padding: '2px 6px',
                  outline: 'none',
                  width: '240px',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={(e) => { if (document.activeElement !== e.target) e.target.style.borderColor = 'var(--color-header-border)'; }}
                onMouseLeave={(e) => { if (document.activeElement !== e.target) e.target.style.borderColor = 'transparent'; }}
                onFocusCapture={(e) => { e.target.style.borderColor = 'var(--color-accent-fg)'; }}
                onBlurCapture={(e) => { e.target.style.borderColor = 'transparent'; }}
              />
            </span>
            {saving && <span style={{ fontSize: '12px', color: 'var(--color-header-muted)' }}>Saving…</span>}
          </div>
          <UserMenu user={user} onLogout={logout} onSettingsOpen={onSettingsOpen} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6">
        {/* Round & turn controls */}
        <div
          className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg mb-6"
          style={{
            backgroundColor: 'var(--color-canvas-default)',
            border: '1px solid var(--color-border-default)',
            boxShadow: 'none',
          }}
        >
          <div className="flex items-center gap-6">
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-fg-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Round</span>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-accent-fg)', lineHeight: 1.2 }}>{round}</div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-fg-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Turn</span>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-fg-default)', lineHeight: 1.3 }}>
                {combatants[activeIndex]?.name ?? '—'}
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <button onClick={prevTurn} style={btnStyle('secondary')} title="Previous turn">←</button>
            <button onClick={nextTurn} style={btnStyle('primary')} title="Next turn">→</button>
            <button onClick={sortByInitiative} style={iconBtnStyle('secondary')} title="Sort by initiative">⇅</button>
            <button onClick={resetRound} style={iconBtnStyle('danger')} title="Reset round">↺</button>
          </div>
        </div>

        {/* Add buttons */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => addCombatant('player')} style={btnStyle('primary')}>+ Add Player</button>
          <button onClick={() => addCombatant('npc')} style={btnStyle('secondary')}>+ Add NPC</button>
        </div>

        {/* Combatant list */}
        {combatants.length === 0 ? (
          <div
            className="text-center py-16 rounded-xl"
            style={{ backgroundColor: 'var(--color-canvas-default)', border: '2px dashed var(--color-border-muted)' }}
          >
            <p style={{ color: 'var(--color-fg-muted)' }}>No combatants yet.</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-fg-subtle)' }}>
              Add players and NPCs using the buttons above.
            </p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={combatants.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {combatants.map((c, i) => (
                  <CombatantCard
                    key={c.id}
                    combatant={c}
                    isActiveRound={i === activeIndex}
                    onUpdate={updateCombatant}
                    onDelete={deleteCombatant}
                    autoFocus={c.id === focusId}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Rules reminder */}
        <div
          className="mt-6 p-4 rounded-lg text-xs"
          style={{
            backgroundColor: 'var(--color-canvas-inset)',
            border: '1px solid var(--color-border-muted)',
            color: 'var(--color-fg-muted)',
          }}
        >
          <strong style={{ color: 'var(--color-fg-default)' }}>D&D 3.5 Initiative Rules:</strong>{' '}
          Roll d20 + DEX modifier; highest acts first. Ties broken by modifier; further ties re-roll.
          Combatants are flat-footed (FF) until their first action.{' '}
          <strong style={{ color: 'var(--color-fg-default)' }}>Saved:</strong> player roster only.
          Initiative values, modifiers, and NPCs reset each session.
        </div>
      </main>
    </div>
  );
}

function btnStyle(variant) {
  const base = { fontSize: '13px', fontWeight: 500, padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', border: 'none' };
  if (variant === 'primary') return { ...base, backgroundColor: 'var(--color-accent-emphasis)', color: '#fff' };
  if (variant === 'danger') return { ...base, backgroundColor: 'transparent', color: 'var(--color-danger-fg)', border: '1px solid var(--color-border-muted)' };
  return { ...base, backgroundColor: 'var(--color-canvas-subtle)', color: 'var(--color-fg-default)', border: '1px solid var(--color-border-default)' };
}

function iconBtnStyle(variant) {
  const base = { fontSize: '16px', lineHeight: 1, width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', cursor: 'pointer', border: '1px solid var(--color-border-muted)', padding: 0, backgroundColor: 'transparent' };
  if (variant === 'danger') return { ...base, color: 'var(--color-danger-fg)' };
  return { ...base, color: 'var(--color-fg-muted)' };
}
