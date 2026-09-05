import { normalizeTeacherItem } from '../data/teachers';

/**
 * Deduplicates a list of student objects by a stable identity key.
 * Priority: id → studentId → email → name+class fallback.
 * Later entries in the array win (last-write-wins) for the same key.
 *
 * @param {Object[]} items - Raw student records to deduplicate.
 * @returns {Object[]} Deduplicated student records.
 */
export function mergeUniqueStudents(items) {
  const map = new Map();
  items.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;
    const key =
      (item.id != null && `id:${String(item.id)}`) ||
      (item.studentId && `studentId:${String(item.studentId)}`) ||
      (item.email && `email:${String(item.email).toLowerCase()}`) ||
      `fallback:${String(item.name || '').toLowerCase()}-${String(item.class || '')}-${index}`;
    map.set(key, item);
  });
  return Array.from(map.values());
}

/**
 * Deduplicates a list of teacher objects by a stable identity key.
 * Priority: employeeId → email → id → name fallback.
 * Later entries in the array win (last-write-wins) for the same key.
 *
 * @param {Object[]} items - Raw teacher records to deduplicate.
 * @returns {Object[]} Deduplicated, normalized teacher records.
 */
export function mergeUniqueTeachers(items) {
  const map = new Map();
  items.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;
    const normalized = normalizeTeacherItem(item, index);
    const key =
      (normalized.employeeId && `employee:${normalized.employeeId}`) ||
      (normalized.email && `email:${String(normalized.email).toLowerCase()}`) ||
      (normalized.id && `id:${String(normalized.id)}`) ||
      `fallback:${String(normalized.name || '').toLowerCase()}-${index}`;
    map.set(key, normalized);
  });
  return Array.from(map.values());
}
