/**
 * ИГРОВОЙ ИНТЕРФЕЙС ДВУХ МИРОВ (HUD)
 * Позволяет переключать режимы (Real Sochi / Cyber Matrix / Hybrid),
 * отслеживать активность Ассистента Триснаса и Ассистента Аполлона,
 * а также видеть живую ленту квестов и 13 уровней персонажей.
 */
import React from 'react';
import { WORLD_THEMES } from '../config/sochiWorldConfig';

export default function DualWorldHUD({
  worldMode,
  onChangeWorldMode,
  characters = [],
  events = [],
  onSelectNode,
  nodes = []
}) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, monospace',
      color: '#ffffff'
    }}>
      {/* Верхняя панель: Переключатель Двух Миров и Статус Ядра */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{
          pointerEvents: 'auto',
          background: 'rgba(6, 10, 24, 0.88)',
          border: '1px solid #00FFCC',
          borderRadius: '12px',
          padding: '16px 20px',
          backdropFilter: 'blur(12px)',
          maxWidth: '520px'
        }}>
          <div style={{ fontSize: '11px', letterSpacing: '2px', color: '#00FFCC', marginBottom: '4px' }}>
            SOCHI REALTIME ENGINE // TRIZNES × SOCHIWOOD
          </div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 800 }}>
            {WORLD_THEMES[worldMode]?.title}
          </h1>
          <p style={{ margin: '0 0 14px 0', fontSize: '12px', opacity: 0.8 }}>
            {WORLD_THEMES[worldMode]?.subtitle}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {Object.values(WORLD_THEMES).map((mode) => (
              <button
                key={mode.id}
                onClick={() => onChangeWorldMode(mode.id)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: worldMode === mode.id ? `1px solid ${mode.accentColor}` : '1px solid rgba(255,255,255,0.2)',
                  background: worldMode === mode.id ? mode.accentColor : 'rgba(255,255,255,0.06)',
                  color: worldMode === mode.id ? '#000' : '#fff',
                  fontWeight: 700,
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                {mode.id.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Панель Нейроживых Ассистентов Ядра */}
        <div style={{
          pointerEvents: 'auto',
          background: 'rgba(6, 10, 24, 0.88)',
          border: '1px solid #FF0055',
          borderRadius: '12px',
          padding: '16px',
          minWidth: '300px',
          backdropFilter: 'blur(12px)'
        }}>
          <div style={{ fontSize: '11px', color: '#FF0055', fontWeight: 700, marginBottom: '8px' }}>
            НЕЙРОЖИВЫЕ АССИСТЕНТЫ ЯДРА (ONLINE)
          </div>
          {characters.map((c) => (
            <div key={c.handle} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 0',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              fontSize: '12px'
            }}>
              <div>
                <span style={{ color: c.primary_hex || '#00FFCC', fontWeight: 700 }}>{c.display_name}</span>
                <div style={{ fontSize: '10px', opacity: 0.75 }}>{c.status_text}</div>
              </div>
              <span style={{
                background: 'rgba(0, 255, 204, 0.15)',
                border: '1px solid #00FFCC',
                padding: '2px 8px',
                borderRadius: '99px',
                fontSize: '11px'
              }}>
                LVL {c.level}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Нижняя панель: Быстрый навигатор по ключевым локациям Сочи */}
      <div style={{
        pointerEvents: 'auto',
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        padding: '12px',
        background: 'rgba(6, 10, 24, 0.85)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.15)'
      }}>
        {nodes.map((node) => (
          <button
            key={node.id}
            onClick={() => onSelectNode && onSelectNode(node)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${node.colorHex}`,
              color: '#fff',
              padding: '8px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              textAlign: 'left'
            }}
          >
            <div style={{ fontSize: '10px', color: node.colorHex, fontWeight: 700 }}>
              TIER {node.tier} // {node.guardian}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600 }}>{node.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
