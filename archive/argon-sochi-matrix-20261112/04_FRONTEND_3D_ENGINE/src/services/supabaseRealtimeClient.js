/**
 * КЛИЕНТ РЕАЛЬНОГО ВРЕМЕНИ SUPABASE
 * Подписывается на изменения позиций персонажей, статусов узлов Сочи
 * и импульсов от нейроассистентов Триснаса и Аполлона.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta?.env?.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta?.env?.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function subscribeToSochiMatrix({ onCharacterUpdate, onNodeUpdate, onWorldEvent }) {
  const channel = supabase
    .channel('sochi-matrix-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'characters' },
      (payload) => {
        if (payload.new && onCharacterUpdate) onCharacterUpdate(payload.new);
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'sochi_nodes' },
      (payload) => {
        if (payload.new && onNodeUpdate) onNodeUpdate(payload.new);
      }
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'world_events' },
      (payload) => {
        if (payload.new && onWorldEvent) onWorldEvent(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
