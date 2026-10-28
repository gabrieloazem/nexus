import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../config.js';

export class SupabaseError extends Error {
  constructor(message, status) { super(message); this.name = 'SupabaseError'; this.status = status; }
}

export async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    const message = data?.message || data?.hint || data?.details || `Erro do Supabase (${response.status})`;
    throw new SupabaseError(message, response.status);
  }
  return data;
}

const queryValue = value => encodeURIComponent(String(value));
export const db = {
  list(table, { order = 'id.asc', filters = '', select = '*' } = {}) {
    const path = `${table}?select=${queryValue(select)}${filters ? `&${filters}` : ''}&order=${queryValue(order)}`;
    return (async () => {
      const all = [];
      const pageSize = 1000;
      for (let offset = 0; ; offset += pageSize) {
        const page = await request(path, { headers: { 'Range-Unit': 'items', Range: `${offset}-${offset + pageSize - 1}` } });
        all.push(...page);
        if (page.length < pageSize) return all;
      }
    })();
  },
  insert(table, rows) { return request(table, { method: 'POST', body: rows }); },
  update(table, id, values) { return request(`${table}?id=eq.${queryValue(id)}`, { method: 'PATCH', body: values }); },
  remove(table, id) { return request(`${table}?id=eq.${queryValue(id)}`, { method: 'DELETE' }); },
  clear(table) { return request(`${table}?id=not.is.null`, { method: 'DELETE' }); },
  replace(table, rows) {
    return request(table, { method: 'POST', body: rows, headers: { Prefer: 'return=representation,resolution=merge-duplicates' } });
  },
};

export function setConnection(online, detail = '') {
  const dot = document.querySelector('#connection-dot');
  const label = document.querySelector('#connection-label');
  dot?.classList.toggle('online', online);
  dot?.classList.toggle('offline', !online);
  if (label) label.textContent = online ? 'Supabase conectado' : (detail || 'Sem conexão com Supabase');
}
