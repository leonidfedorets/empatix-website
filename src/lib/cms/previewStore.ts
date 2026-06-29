/**
 * Tiny pub/sub store that lets the admin editor push in-progress edits
 * into the live preview iframe without saving to the database. The CMS
 * hooks (`useCmsSection`, `useCmsCollection`) merge any matching override
 * on top of the server data, so the page rerenders as the user types.
 */
type AnyRecord = Record<string, unknown>;
type CollectionRow = { id: string; data: AnyRecord; sort_order: number };

const sections = new Map<string, AnyRecord>();
const collections = new Map<string, CollectionRow[]>();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export const cmsPreviewStore = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  getSection(key: string): AnyRecord | undefined {
    return sections.get(key);
  },
  getCollection(key: string): CollectionRow[] | undefined {
    return collections.get(key);
  },
  setSection(key: string, data: AnyRecord | null) {
    if (data === null) sections.delete(key);
    else sections.set(key, data);
    emit();
  },
  setCollection(key: string, rows: CollectionRow[] | null) {
    if (rows === null) collections.delete(key);
    else collections.set(key, rows);
    emit();
  },
  clearSection(key: string) {
    if (sections.delete(key)) emit();
  },
  clearCollection(key: string) {
    if (collections.delete(key)) emit();
  },
  clearAll() {
    sections.clear();
    collections.clear();
    emit();
  },
};
