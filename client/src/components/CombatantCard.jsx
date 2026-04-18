import { useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * Combatant type:
 * { id, name, type: 'player'|'npc', initiative, modifier, isActive, flatFooted }
 *
 * D&D 3.5 rules:
 * - Initiative = d20 roll + DEX modifier
 * - Sorted highest to lowest
 * - Ties resolved by highest modifier; further ties re-roll (handled by user)
 * - Flat-footed before first action
 */
export function CombatantCard({ combatant, isActiveRound, onUpdate, onDelete, autoFocus }) {
  const nameRef = useRef(null);

  useEffect(() => {
    if (autoFocus) nameRef.current?.focus();
  }, [autoFocus]);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: combatant.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const isNPC = combatant.type === 'npc';

  const accentColor = isNPC
    ? 'var(--color-attention-fg)'
    : 'var(--color-accent-fg)';

  const accentBg = isNPC
    ? 'var(--color-attention-subtle)'
    : 'var(--color-accent-subtle)';

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: isActiveRound
          ? 'var(--color-success-subtle)'
          : 'var(--color-canvas-default)',
        border: `1px solid ${isActiveRound ? 'var(--color-success-fg)' : 'var(--color-border-default)'}`,
        borderRadius: '8px',
        boxShadow: isDragging ? 'var(--color-shadow-large)' : 'var(--color-shadow-medium)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        userSelect: 'none',
      }}
    >
      {/* Drag handle */}
      <span
        {...attributes}
        {...listeners}
        style={{
          cursor: 'grab',
          color: 'var(--color-fg-subtle)',
          fontSize: '16px',
          lineHeight: 1,
          padding: '4px',
          flexShrink: 0,
        }}
        title="Drag to reorder"
      >
        ⠿
      </span>

      {/* Type badge */}
      <span
        style={{
          backgroundColor: accentBg,
          color: accentColor,
          border: `1px solid ${accentColor}`,
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 600,
          padding: '1px 6px',
          flexShrink: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {isNPC ? 'NPC' : 'PC'}
      </span>

      {/* Name */}
      <input
        ref={nameRef}
        type="text"
        value={combatant.name}
        onChange={(e) => onUpdate({ ...combatant, name: e.target.value })}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          flex: 1,
          border: '1px solid transparent',
          borderRadius: '4px',
          outline: 'none',
          backgroundColor: 'transparent',
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--color-fg-default)',
          minWidth: 0,
          padding: '2px 4px',
          cursor: 'text',
          transition: 'border-color 0.15s',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--color-accent-fg)'; e.target.select(); }}
        onBlur={(e) => e.target.style.borderColor = 'transparent'}
        placeholder="Name"
      />

      {/* Initiative roll */}
      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
        <span style={{ fontSize: '10px', color: 'var(--color-fg-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Roll
        </span>
        <input
          type="number"
          value={combatant.initiative}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            onUpdate({ ...combatant, initiative: isNaN(val) ? 1 : Math.min(20, Math.max(1, val)) });
          }}
          style={{
            width: '52px',
            textAlign: 'center',
            border: '1px solid var(--color-border-default)',
            borderRadius: '6px',
            padding: '4px 6px',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-fg-default)',
            backgroundColor: 'var(--color-canvas-subtle)',
          }}
          min="1"
          max="20"
          onFocus={(e) => e.target.select()}
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
        <span style={{ fontSize: '10px', color: 'var(--color-fg-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Mod
        </span>
        <input
          type="number"
          value={combatant.modifier}
          onChange={(e) => onUpdate({ ...combatant, modifier: parseInt(e.target.value, 10) || 0 })}
          style={{
            width: '52px',
            textAlign: 'center',
            border: '1px solid var(--color-border-default)',
            borderRadius: '6px',
            padding: '4px 6px',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-fg-default)',
            backgroundColor: 'var(--color-canvas-subtle)',
          }}
          min="-10"
          max="20"
          onFocus={(e) => e.target.select()}
        />
      </label>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
        <span style={{ fontSize: '10px', color: 'var(--color-fg-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Total
        </span>
        <span
          style={{
            width: '52px',
            textAlign: 'center',
            fontSize: '16px',
            fontWeight: 700,
            color: accentColor,
            backgroundColor: accentBg,
            borderRadius: '6px',
            padding: '4px 6px',
            border: `1px solid ${accentColor}33`,
          }}
        >
          {Math.max(1, combatant.initiative + combatant.modifier)}
        </span>
      </div>

      {/* Flat-footed badge */}
      <button
        title={combatant.flatFooted ? 'Flat-footed (click to clear)' : 'Mark flat-footed'}
        onClick={() => onUpdate({ ...combatant, flatFooted: !combatant.flatFooted })}
        style={{
          fontSize: '11px',
          fontWeight: 600,
          padding: '2px 6px',
          borderRadius: '4px',
          border: '1px solid var(--color-border-default)',
          cursor: 'pointer',
          backgroundColor: combatant.flatFooted ? 'var(--color-attention-subtle)' : 'transparent',
          color: combatant.flatFooted ? 'var(--color-attention-fg)' : 'var(--color-fg-subtle)',
          flexShrink: 0,
        }}
      >
        FF
      </button>

      {/* Delete */}
      <button
        onClick={() => onDelete(combatant.id)}
        title="Remove combatant"
        style={{
          color: 'var(--color-danger-fg)',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          padding: '4px',
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
}
