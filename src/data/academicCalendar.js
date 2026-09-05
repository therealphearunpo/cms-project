/**
 * Cambodia MoEYS Academic Calendar Constants
 * Aligned with Ministry of Education, Youth and Sport (MoEYS) academic structure.
 *
 * Cambodian school year: November → August
 * Semester 1 (វគ្គ ១): November → February
 * Semester 2 (វគ្គ ២): March → August
 */

// ---------------------------------------------------------------------------
// Academic Year
// ---------------------------------------------------------------------------

export const CURRENT_ACADEMIC_YEAR = '2024-2025';

export const academicYearOptions = [
  { value: '2024-2025', label: 'ឆ្នាំសិក្សា ២០២៤-២០២៥ (2024-2025)' },
  { value: '2023-2024', label: 'ឆ្នាំសិក្សា ២០២៣-២០២៤ (2023-2024)' },
  { value: '2025-2026', label: 'ឆ្នាំសិក្សា ២០២៥-២០២៦ (2025-2026)' },
];

// ---------------------------------------------------------------------------
// Semesters (វគ្គ)
// ---------------------------------------------------------------------------

export const SEMESTER_1 = 'S1';
export const SEMESTER_2 = 'S2';

export const semesterOptions = [
  { value: SEMESTER_1, label: 'វគ្គ ១ (Semester 1) — វិច្ឆិកា → កុម្ភៈ' },
  { value: SEMESTER_2, label: 'វគ្គ ២ (Semester 2) — មីនា → សីហា' },
];

export const SEMESTER_LABELS = {
  [SEMESTER_1]: 'វគ្គ ១',
  [SEMESTER_2]: 'វគ្គ ២',
};

// Months that belong to each semester (0-indexed JS month numbers)
export const SEMESTER_MONTHS = {
  [SEMESTER_1]: [10, 11, 0, 1], // Nov, Dec, Jan, Feb
  [SEMESTER_2]: [2, 3, 4, 5, 6, 7], // Mar, Apr, May, Jun, Jul, Aug
};

/**
 * Returns the current semester based on month.
 * @param {Date} [date] - Defaults to today
 * @returns {'S1'|'S2'}
 */
export function getCurrentSemester(date = new Date()) {
  const month = date.getMonth();
  return SEMESTER_MONTHS[SEMESTER_1].includes(month) ? SEMESTER_1 : SEMESTER_2;
}

// ---------------------------------------------------------------------------
// Khmer Month Names (based on Chuon Nath)
// ---------------------------------------------------------------------------

export const KHMER_MONTHS = [
  'មករា',    // January
  'កុម្ភៈ',   // February
  'មីនា',    // March
  'មេសា',    // April
  'ឧសភា',   // May
  'មិថុនា',  // June
  'កក្កដា',  // July
  'សីហា',    // August
  'កញ្ញា',   // September
  'តុលា',    // October
  'វិច្ឆិកា', // November
  'ធ្នូ',     // December
];

export const KHMER_DAYS = [
  'អាទិត្យ', // Sunday
  'ចន្ទ',    // Monday
  'អង្គារ',  // Tuesday
  'ពុធ',     // Wednesday
  'ព្រហស្បតិ៍', // Thursday
  'សុក្រ',   // Friday
  'សៅរ៍',    // Saturday
];

/**
 * Format a date in Khmer locale style.
 * @param {Date|string} date
 * @returns {string} e.g. "ថ្ងៃចន្ទ ទី ១ មករា ២០២៥"
 */
export function formatKhmerDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const day = KHMER_DAYS[d.getDay()];
  const dateNum = d.getDate();
  const month = KHMER_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `ថ្ងៃ${day} ទី ${dateNum} ${month} ${year}`;
}

// ---------------------------------------------------------------------------
// Cambodia Public Holidays (MoEYS School Calendar)
// ---------------------------------------------------------------------------

export const CAMBODIA_HOLIDAYS = [
  { date: '01-01', label: 'ទិវាចូលឆ្នាំសកល (International New Year)', en: 'International New Year' },
  { date: '01-07', label: 'ទិវាជ័យជំនះ ០៧ មករា (Victory Day)', en: 'Victory Day' },
  { date: '03-08', label: 'ទិវាអន្តរជាតិនារី (International Women\'s Day)', en: 'International Women\'s Day' },
  // Khmer New Year: ~April 13-15 (adjusts yearly)
  { date: '04-13', label: 'ទិវាចូលឆ្នាំថ្មីខ្មែរ (Khmer New Year Day 1)', en: 'Khmer New Year' },
  { date: '04-14', label: 'ទិវាចូលឆ្នាំថ្មីខ្មែរ (Khmer New Year Day 2)', en: 'Khmer New Year' },
  { date: '04-15', label: 'ទិវាចូលឆ្នាំថ្មីខ្មែរ (Khmer New Year Day 3)', en: 'Khmer New Year' },
  { date: '04-17', label: 'ទិវារំឭកជនរងគ្រោះ ១៧ មេសា (Day of Remembrance)', en: 'Day of Remembrance' },
  { date: '05-01', label: 'ទិវាពលកម្មអន្តរជាតិ (Labour Day)', en: 'Labour Day' },
  { date: '05-13', label: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម (King\'s Birthday)', en: 'King\'s Birthday' },
  { date: '05-14', label: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម (King\'s Birthday)', en: 'King\'s Birthday' },
  { date: '05-20', label: 'ទិវាជាតិ (National Day / Genocide Remembrance)', en: 'National Day' },
  { date: '06-01', label: 'ទិវាអន្តរជាតិកុមារ (International Children\'s Day)', en: 'Children\'s Day' },
  // Pchum Ben: ~Sept/Oct (lunar, ~15 days)
  { date: '09-15', label: 'ទិវាបុណ្យភ្ជុំបិណ្ឌ (Pchum Ben - approximate)', en: 'Pchum Ben' },
  { date: '10-23', label: 'ទិវាប្រកាសរដ្ឋធម្មនុញ្ញ (Constitution Day)', en: 'Constitution Day' },
  { date: '10-29', label: 'ព្រះរាជពិធីគ្រងរាជ្យ (Coronation Day)', en: 'Coronation Day' },
  { date: '11-09', label: 'ទិវាឯករាជ្យ (Independence Day)', en: 'Independence Day' },
  // Water Festival: ~Nov (lunar, 3 days)
  { date: '11-14', label: 'បុណ្យអុំទូក (Water Festival - approximate)', en: 'Water Festival' },
  { date: '12-10', label: 'ទិវាសិទ្ធិមនុស្ស (Human Rights Day)', en: 'Human Rights Day' },
];

// ---------------------------------------------------------------------------
// Evaluation Months per Semester
// ---------------------------------------------------------------------------

export const SEMESTER_EVAL_MONTHS = {
  [SEMESTER_1]: [
    { value: '11', label: 'វិច្ឆិកា (November)' },
    { value: '12', label: 'ធ្នូ (December)' },
    { value: '01', label: 'មករា (January)' },
    { value: '02', label: 'កុម្ភៈ (February)' },
  ],
  [SEMESTER_2]: [
    { value: '03', label: 'មីនា (March)' },
    { value: '04', label: 'មេសា (April)' },
    { value: '05', label: 'ឧសភា (May)' },
    { value: '06', label: 'មិថុនា (June)' },
    { value: '07', label: 'កក្កដា (July)' },
    { value: '08', label: 'សីហា (August)' },
  ],
};

// Max absence days before student is flagged (MoEYS rule)
export const MAX_ALLOWED_ABSENCE_DAYS = 30;
export const ABSENCE_WARNING_THRESHOLD = 25; // warn before reaching the limit
