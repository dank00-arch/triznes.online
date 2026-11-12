/**
 * КОРНЕВОЙ КОМПОНЕНТ ИГРЫ ПЕРСОНАЖЕЙ СОЧИ
 * Объединяет 3D-сцену, HUD-интерфейс Двух Миров, карточку медиа-узла
 * и живую подписку на Supabase Realtime (сигналы от Триснаса и Аполлона).
 */
import React, { useState, useEffect } from 'react';
import Sochi3DMatrixCanvas from './components/Sochi3DMatrixCanvas';
import DualWorldHUD from './components/DualWorldHUD';
import MediaNodeModal from './components/MediaNodeModal';
import { INITIAL_SOCHI_NODES } from './config/sochiWorldConfig';
import { subscribeToSochiMatrix } from './services/supabaseRealtimeClient';

const DEFAULT_CHARACTERS = [
  {
    handle: 'trisnas_core',
    display_name: 'Ассистент Триснас',
    level: 13,
    is_ai_core: true,
    lat: 43.5738,
    lng: 39.7295,
    elevation: 120,
    primary_hex: '#00FFCC',
    status_text: 'Ядро ТРИЗНЕС // Приморская'
  },
  {
    handle: 'apollo_muse',
    display_name: 'Ассистент Аполлон',
    level: 13,
    is_ai_core: true,
    lat: 43.5806,
    lng: 39.7188,
    elevation: 100,
    primary_hex: '#FF0055',
    status_text: 'Портал SOCHIWOOD × ТЕАТР ТУЗ'
  },
  {
    handle: 'tuz_archon',
    display_name: 'Мастер Игры (ТЕАТР ТУЗ)',
    level: 12,
    is_ai_core: false,
    lat: 43.5772,
    lng: 39.7260,
    elevation: 45,
    primary_hex: '#B800FF',
    status_text: 'Коллайдер Персонажей'
  },
  {
    handle: 'xpro_titan',
    display_name: 'Инженер XPRO',
    level: 9,
    is_ai_core: false,
    lat: 43.5868,
    lng: 39.7242,
    elevation: 15,
    primary_hex: '#3399FF',
    status_text: 'Техно-станция Навагинская'
  }
];

export default function App() {
  const [worldMode, setWorldMode] = useState('hybrid');
  const [nodes, setNodes] = useState(INITIAL_SOCHI_NODES);
  const [characters, setCharacters] = useState(DEFAULT_CHARACTERS);
  const [selectedNode, setSelectedNode] = useState(INITIAL_SOCHI_NODES[0]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToSochiMatrix({
      onCharacterUpdate: (updatedChar) => {
        setCharacters((prev) => {
          const exists = prev.some((c) => c.handle === updatedChar.handle);
          return exists
            ? prev.map((c) => (c.handle === updatedChar.handle ? { ...c, ...updatedChar } : c))
            : [...prev, updatedChar];
        });
      },
      onNodeUpdate: (updatedNode) => {
        setNodes((prev) =>
          prev.map((n) => (n.id === updatedNode.id ? { ...n, ...updatedNode } : n))
        );
      },
      onWorldEvent: (newEvent) => {
        setEvents((prev) => [newEvent, ...prev.slice(0, 9)]);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Sochi3DMatrixCanvas
        worldMode={worldMode}
        nodes={nodes}
        characters={characters}
        selectedNode={selectedNode}
        onSelectNode={setSelectedNode}
      />
      <DualWorldHUD
        worldMode={worldMode}
        onChangeWorldMode={setWorldMode}
        characters={characters}
        events={events}
        nodes={nodes}
        onSelectNode={setSelectedNode}
      />
      <MediaNodeModal
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}
