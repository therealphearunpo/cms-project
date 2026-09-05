/**
 * MoEYS Marksheet Utilities
 *
 * Score Model:
 *   Each subject stores { monthly: number (0-100), exam: number (0-100) }
 *   Final subject average = (monthly + exam) / 2
 *
 * MoEYS Grading Scale:
 *   A >= 85  (ល្អប្រសើរ — Excellent)
 *   B >= 75  (ល្អណាស់  — Very Good)
 *   C >= 65  (ល្អ       — Good)
 *   D >= 60  (ល្អបង្គួរ — Fair)
 *   E >= 50  (មធ្យម    — Pass)
 *   F <  50  (ខ្សោយ    — Fail)
 */

import { SEMESTER_1, SEMESTER_2 } from '../../data/academicCalendar';

export { SEMESTER_1, SEMESTER_2 };

export const LOCAL_MARKSHEETS_KEY = 'marksheets_local_v2';
export const LOCAL_STUDENTS_KEY = 'students_local_v2';

// ---------------------------------------------------------------------------
// Full MoEYS Subject List (Lower & Upper Secondary)
// ---------------------------------------------------------------------------

/**
 * Core academic subjects tracked in the grade book.
 * These are the subjects scored with monthly + exam scores.
 */
export const SUBJECTS = [
  'khmer',
  'mathematics',
  'physics',
  'chemistry',
  'biology',
  'earth-science',
  'english',
  'french',
  'history',
  'geography',
  'moral-civics',
  'social-studies',
  'computer',
  'physical-education',
];

export const SUBJECT_LABELS = {
  khmer: 'ភាសាខ្មែរ',
  mathematics: 'គណិតវិទ្យា',
  physics: 'រូបវិទ្យា',
  chemistry: 'គីមីវិទ្យា',
  biology: 'ជីវវិទ្យា',
  'earth-science': 'ផែនដី-បរិស្ថាន',
  english: 'ភាសាអង់គ្លេស',
  french: 'ភាសាបារាំង',
  history: 'ប្រវត្តិវិទ្យា',
  geography: 'ភូមិវិទ្យា',
  'moral-civics': 'សីលធម៌-ពលរដ្ឋ',
  'social-studies': 'វិទ្យាសា.សង្គម',
  computer: 'បច្ចេកវិទ្យា',
  'physical-education': 'អប់រំកាយ',
};

export const SUBJECT_LABELS_EN = {
  khmer: 'Khmer',
  mathematics: 'Mathematics',
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  'earth-science': 'Earth Sci.',
  english: 'English',
  french: 'French',
  history: 'History',
  geography: 'Geography',
  'moral-civics': 'Civics',
  'social-studies': 'Social Std.',
  computer: 'ICT',
  'physical-education': 'PE',
};

// ---------------------------------------------------------------------------
// Storage Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Score Helpers
// ---------------------------------------------------------------------------

export function clampScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Compute the final subject score from monthly and exam components.
 * MoEYS formula: final = (monthly + exam) / 2
 * @param {{ monthly?: number, exam?: number } | number | null} scoreEntry
 * @returns {number}
 */
export function computeSubjectScore(scoreEntry) {
  if (scoreEntry == null) return 0;
  // Legacy: plain number
  if (typeof scoreEntry === 'number') return clampScore(scoreEntry);
  if (typeof scoreEntry === 'object') {
    const monthly = clampScore(scoreEntry.monthly ?? 0);
    const exam = clampScore(scoreEntry.exam ?? 0);
    return Math.round((monthly + exam) / 2);
  }
  return clampScore(scoreEntry);
}

/**
 * Build an empty score entry for a subject.
 * @returns {{ monthly: number, exam: number }}
 */
export function emptyScoreEntry() {
  return { monthly: 0, exam: 0 };
}

// ---------------------------------------------------------------------------
// Student Normalization
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Score Map Normalization
// Supports both old (single number) and new (monthly+exam object) formats
// ---------------------------------------------------------------------------

export function normalizeScoreMap(payload) {
  if (!payload) return {};

  if (Array.isArray(payload)) {
    return payload.reduce((acc, item) => {
      const studentId = item?.studentId ?? item?.id;
      if (studentId == null) return acc;
      acc[String(studentId)] = SUBJECTS.reduce((scores, subject) => {
        const raw = item?.scores?.[subject] ?? item?.[subject];
        scores[subject] =
          raw != null && typeof raw === 'object'
            ? { monthly: clampScore(raw.monthly), exam: clampScore(raw.exam) }
            : emptyScoreEntry();
        return scores;
      }, {});
      return acc;
    }, {});
  }

  if (typeof payload === 'object') {
    return Object.entries(payload).reduce((acc, [studentId, value]) => {
      acc[String(studentId)] = SUBJECTS.reduce((scores, subject) => {
        const raw = value?.scores?.[subject] ?? value?.[subject];
        scores[subject] =
          raw != null && typeof raw === 'object'
            ? { monthly: clampScore(raw.monthly), exam: clampScore(raw.exam) }
            : emptyScoreEntry();
        return scores;
      }, {});
      return acc;
    }, {});
  }

  return {};
}

// ---------------------------------------------------------------------------
// MoEYS Grading
// ---------------------------------------------------------------------------

/**
 * MoEYS Grading Scale:
 * - A: >= 85 (Excellent / ល្អប្រសើរ)
 * - B: >= 75 (Very Good / ល្អណាស់)
 * - C: >= 65 (Good / ល្អ)
 * - D: >= 60 (Fair / ល្អបង្គួរ)
 * - E: >= 50 (Pass / មធ្យម)
 * - F: <  50 (Fail / ខ្សោយ)
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

export const GRADE_KHMER_LABELS = {
  A: 'ល្អប្រសើរ',
  B: 'ល្អណាស់',
  C: 'ល្អ',
  D: 'ល្អបង្គួរ',
  E: 'មធ្យម',
  F: 'ខ្សោយ',
};

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
 * Determine if a student passes based on all subject scores.
 * MoEYS pass rule: all subjects must be >= 50 (grade E or above).
 * @param {Object} subjectScores - map of subject -> { monthly, exam } | number
 * @returns {boolean}
 */
export function isStudentPassing(subjectScores) {
  if (!subjectScores || typeof subjectScores !== 'object') return false;
  return SUBJECTS.every((subject) => {
    const score = computeSubjectScore(subjectScores[subject]);
    return score >= 50;
  });
}

// ---------------------------------------------------------------------------
// Class Rankings
// ---------------------------------------------------------------------------

/**
 * Computes dense rank within class (1st, 2nd, 3rd…)
 * Uses the pre-computed `avg` field on each row.
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

// ---------------------------------------------------------------------------
// Marksheet Storage Key with Semester & Academic Year
// ---------------------------------------------------------------------------

/**
 * Returns the localStorage key scoped to a specific semester and academic year.
 * @param {string} semester - 'S1' | 'S2'
 * @param {string} academicYear - e.g. '2024-2025'
 * @returns {string}
 */
export function getMarksheetStorageKey(semester = SEMESTER_1, academicYear = '2024-2025') {
  return `${LOCAL_MARKSHEETS_KEY}_${academicYear}_${semester}`;
}
