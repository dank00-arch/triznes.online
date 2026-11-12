/**
 * МОДАЛЬНОЕ ОКНО ЛОКАЦИИ И МЕДИА-ПОТОКА СОЧИ
 * Открывается при клике на любую 3D-башню города (Приморская, Морпорт, Навагинская,
 * XPRO, ТЕАТР ТУЗ, Школа ремонта, Красная Поляна) и показывает ее статус в обоих мирах.
 */
import React from 'react';

export default function MediaNodeModal({ node, onClose }) {
  if (!node) return null;

  return (
    <div style={{
      position: 'fixed',
      right: '24px',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '360px',
      background: 'rgba(8, 12, 26, 0.95)',
      border: `2px solid ${node.colorHex || '#00FFCC'}`,
      borderRadius: '16px',
      padding: '20px',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif',
      zIndex: 50,
      boxShadow: `0 0 30px ${node.colorHex || '#00FFCC'}44`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: node.colorHex, fontWeight: 700 }}>
          УРОВЕНЬ УЗЛА: {node.tier} / 13
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff',
            borderRadius: '6px',
            padding: '4px 8px',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>

      <h2 style={{ margin: '10px 0 4px 0', fontSize: '18px' }}>{node.name}</h2>
      <div style={{ fontSize: '12px', color: '#00FFCC', marginBottom: '12px' }}>
        Хранитель: {node.guardian}
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.05)',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '12px',
        fontSize: '12px'
      }}>
        <div><strong>Физический мир (SOCHIWOOD):</strong> {node.realTitle}</div>
        <div style={{ marginTop: '4px' }}><strong>Кибер-матрица (TRIZNES):</strong> {node.cyberTitle}</div>
      </div>

      <p style={{ fontSize: '13px', lineHeight: 1.5, opacity: 0.9 }}>
        {node.description}
      </p>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
        {(node.tags || []).map((tag) => (
          <span key={tag} style={{
            fontSize: '11px',
            padding: '3px 8px',
            borderRadius: '6px',
            background: 'rgba(0, 255, 204, 0.12)',
            border: '1px solid rgba(0, 255, 204, 0.35)'
          }}>
            #{tag}
          </span>
        ))}
      </div>

      <div style={{ marginTop: '16px', fontSize: '11px', opacity: 0.7 }}>
        GPS Сочи: {node.lat}° N, {node.lng}° E
      </div>
    </div>
  );
}
