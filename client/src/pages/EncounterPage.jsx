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
import { useAuth } from '../context/AuthContext';

let _idCounter = 1;
function newId() { return `c-${Date.now()}-${_idCounter++}`; }

export function EncounterPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [session, setSession] = useState(null);
  const [combatants, setCombatants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetch(`/api/sessions/${id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        setSession(data);
        setCombatants(data.combatants || []);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [id]);

  const save = useCallback(async (newCombatants, round) => {
    setSaving(true);
    try {
      await fetch(`/api/sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          combatants: newCombatants,
          round: round ?? session?.round ?? 1,
        }),
      });
    } finally {
      setSaving(false);
    }
  }, [id, session]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setCombatants((prev) => {
      const oldIndex = prev.findIndex((c) => c.id === active.id);
      const newIndex = prev.findIndex((c) => c.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);

      // Reassign initiative totals based on new visual order (highest = first position)
      // Per D&D 3.5: order is highest-to-lowest. Dragging manually sets the order.
      save(reordered);
      return reordered;
    });
  };

  const sortByInitiative = () => {
    setCombatants((prev) => {
      const sorted = [...prev].sort((a, b) => {
        const totalA = a.initiative + a.modifier;
        const totalB = b.initiative + b.modifier;
        if (totalB !== totalA) return totalB - totalA;
        // Tie-break by modifier (D&D 3.5 rule)
        return b.modifier - a.modifier;
      });
      save(sorted);
      return sorted;
    });
    setActiveIndex(0);
  };

  const addCombatant = (type) => {
    const c = {
      id: newId(),
      name: type === 'npc' ? 'NPC' : 'Player',
      type,
      initiative: 0,
      modifier: 0,
      flatFooted: false,
    };
    setCombatants((prev) => {
      const next = [...prev, c];
      save(next);
      return next;
    });
  };

  const updateCombatant = (updated) => {
    setCombatants((prev) => {
      const next = prev.map((c) => (c.id === updated.id ? updated : c));
      save(next);
      return next;
    });
  };

  const deleteCombatant = (cid) => {
    setCombatants((prev) => {
      const next = prev.filter((c) => c.id !== cid);
      save(next);
      return next;
    });
  };

  const nextTurn = () => {
    setActiveIndex((prev) => {
      const next = prev + 1;
      if (next >= combatants.length) {
        // New round
        const newRound = (session?.round ?? 1) + 1;
        setSession((s) => ({ ...s, round: newRound }));
        // All combatants are no longer flat-footed after first round
        const clearedFlatFooted = combatants.map((c) => ({ ...c, flatFooted: false }));
        setCombatants(clearedFlatFooted);
        save(clearedFlatFooted, newRound);
        return 0;
      }
      return next;
    });
  };

  const prevTurn = () => {
    setActiveIndex((prev) => Math.max(0, prev - 1));
  };

  const resetRound = () => {
    setActiveIndex(0);
    const newRound = 1;
    setSession((s) => ({ ...s, round: newRound }));
    save(combatants, newRound);
  };

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
      {/* Header */}
      <header style={{
        backgroundColor: '#24292f',
        borderBottom: '1px solid #444c56',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              style={{ color: '#adbac7', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px' }}
              title="Back to sessions"
            >←</button>
            <span className="font-semibold text-base" style={{ color: '#ffffff' }}>
              {session?.name ?? 'Encounter'}
            </span>
            {saving && (
              <span style={{ fontSize: '12px', color: '#adbac7' }}>Saving…</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {user?.avatar && (
              <img src={user.avatar} alt="" className="w-7 h-7 rounded-full" />
            )}
            <button
              onClick={logout}
              className="text-sm px-3 py-1 rounded-md"
              style={{ color: '#adbac7', border: '1px solid #444c56', backgroundColor: 'transparent', cursor: 'pointer' }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6">
        {/* Round & turn controls */}
        <div
          className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg mb-6"
          style={{
            backgroundColor: 'var(--color-canvas-default)',
            border: '1px solid var(--color-border-default)',
            boxShadow: 'var(--color-shadow-medium)',
          }}
        >
          <div className="flex items-center gap-6">
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-fg-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Round
              </span>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-accent-fg)', lineHeight: 1.2 }}>
                {session?.round ?? 1}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-fg-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Turn
              </span>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-fg-default)', lineHeight: 1.3 }}>
                {combatants[activeIndex]?.name ?? '—'}
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={prevTurn} style={btnStyle('secondary')}>← Prev</button>
            <button onClick={nextTurn} style={btnStyle('primary')}>Next Turn →</button>
            <button onClick={sortByInitiative} style={btnStyle('secondary')}>Auto-Sort</button>
            <button onClick={resetRound} style={btnStyle('danger')}>Reset</button>
          </div>
        </div>

        {/* Add combatant buttons */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => addCombatant('player')} style={btnStyle('primary')}>
            + Add Player
          </button>
          <button onClick={() => addCombatant('npc')} style={btnStyle('secondary')}>
            + Add NPC
          </button>
        </div>

        {/* Combatant list */}
        {combatants.length === 0 ? (
          <div
            className="text-center py-16 rounded-xl"
            style={{
              backgroundColor: 'var(--color-canvas-default)',
              border: '2px dashed var(--color-border-muted)',
            }}
          >
            <p style={{ color: 'var(--color-fg-muted)' }}>No combatants yet.</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-fg-subtle)' }}>
              Add players and NPCs using the buttons above.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={combatants.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {combatants.map((c, i) => (
                  <CombatantCard
                    key={c.id}
                    combatant={c}
                    isActiveRound={i === activeIndex}
                    onUpdate={updateCombatant}
                    onDelete={deleteCombatant}
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
          Each combatant rolls d20 and adds their DEX modifier. Higher results act first.
          Ties are broken by the higher modifier; further ties require a re-roll.
          Combatants are flat-footed (FF) until their first action in combat.
          Use <em>Auto-Sort</em> to sort by total, or drag cards to set order manually.
        </div>
      </main>
    </div>
  );
}

function btnStyle(variant) {
  const base = {
    fontSize: '13px',
    fontWeight: 500,
    padding: '6px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    border: 'none',
  };
  if (variant === 'primary') return { ...base, backgroundColor: 'var(--color-accent-emphasis)', color: '#fff' };
  if (variant === 'danger') return { ...base, backgroundColor: 'transparent', color: 'var(--color-danger-fg)', border: '1px solid var(--color-border-muted)' };
  return { ...base, backgroundColor: 'var(--color-canvas-subtle)', color: 'var(--color-fg-default)', border: '1px solid var(--color-border-default)' };
}
