export const LOCAL_MARKSHEETS_KEY = 'marksheets_local_v2';
export const LOCAL_STUDENTS_KEY = 'students_local_v2';
export const SUBJECTS = [
  'khmer',
  'mathematics',
  'physics',
  'chemistry',
  'biology',
  'history',
  'english',
];

export const SUBJECT_LABELS = {
  khmer: 'Khmer (ភាសាខ្មែរ)',
  mathematics: 'Math (គណិត)',
  physics: 'Physics (រូបវិទ្យា)',
  chemistry: 'Chemistry (គីមី)',
  biology: 'Biology (ជីវវិទ្យា)',
  history: 'History (ប្រវត្តិ)',
  english: 'English (អង់គ្លេស)',
};

export function safeReadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors.
  }
}

export function clampScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function normalizeStudent(student) {
  return {
    ...student,
  };
}

export function uniqueStudents(students) {
  const seen = new Set();

  return (Array.isArray(students) ? students : []).filter((student) => {
    const normalized = normalizeStudent(student);
    const key =
      normalized.id != null
        ? `id:${String(normalized.id)}`
        : [normalized.name, normalized.class, normalized.rollNo]
            .map((value) => String(value ?? '').trim())
            .join('|');

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function normalizeScoreMap(payload) {
  if (!payload) return {};

  if (Array.isArray(payload)) {
    return payload.reduce((acc, item) => {
      const studentId = item?.studentId ?? item?.id;
      if (studentId == null) return acc;
      acc[String(studentId)] = SUBJECTS.reduce((scores, subject) => {
        if (item?.scores && typeof item.scores === 'object') {
          scores[subject] = clampScore(item.scores[subject]);
        } else {
          scores[subject] = clampScore(item?.[subject]);
        }
        return scores;
      }, {});
      return acc;
    }, {});
  }

  if (typeof payload === 'object') {
    return Object.entries(payload).reduce((acc, [studentId, value]) => {
      acc[String(studentId)] = SUBJECTS.reduce((scores, subject) => {
        if (
          value &&
          typeof value === 'object' &&
          value.scores &&
          typeof value.scores === 'object'
        ) {
          scores[subject] = clampScore(value.scores[subject]);
        } else {
          scores[subject] = clampScore(value?.[subject]);
        }
        return scores;
      }, {});
      return acc;
    }, {});
  }

  return {};
}

/**
 * MoEYS Grading Scale:
 * - A: >= 85 (Excellent / ល្អប្រសើរ)
 * - B: >= 75 (Very Good / ល្អណាស់)
 * - C: >= 65 (Good / ល្អ)
 * - D: >= 60 (Fair / ល្អបង្គួរ)
 * - E: >= 50 (Pass / មធ្យម)
 * - F: < 50  (Fail / ខ្សោយ)
 */
export function getGradeFromAverage(avg) {
  if (avg == null || !Number.isFinite(Number(avg))) return '-';
  const score = Number(avg);
  if (score >= 85) return 'A';
  if (score >= 75) return 'B';
  if (score >= 65) return 'C';
  if (score >= 60) return 'D';
  if (score >= 50) return 'E';
  return 'F';
}

export function getGradeBadgeColor(grade) {
  switch (grade) {
    case 'A':
      return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    case 'B':
      return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20';
    case 'C':
      return 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/20';
    case 'D':
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20';
    case 'E':
      return 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20';
    case 'F':
      return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20';
    default:
      return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20';
  }
}

/**
 * Computes dense rank within class (1st, 2nd, 3rd...)
 */
export function computeClassRankings(rows) {
  if (!Array.isArray(rows)) return [];
  const validRows = rows.filter((r) => r.avg != null && Number.isFinite(Number(r.avg)));
  const sorted = [...validRows].sort((a, b) => Number(b.avg) - Number(a.avg));

  const rankMap = new Map();
  let currentRank = 1;

  sorted.forEach((row, index) => {
    if (index > 0 && Number(row.avg) < Number(sorted[index - 1].avg)) {
      currentRank = index + 1;
    }
    rankMap.set(String(row.studentId), currentRank);
  });

  return rows.map((row) => ({
    ...row,
    rank: rankMap.get(String(row.studentId)) ?? '-',
  }));
}
