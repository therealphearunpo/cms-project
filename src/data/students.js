export const gradeLevels = [7, 8, 9, 10, 11, 12];
const classSections = ['A', 'B', 'C'];

export const SHIFT_MORNING = 'Morning';
export const SHIFT_AFTERNOON = 'Afternoon';
export const SHIFT_FULL_DAY = 'Full Day';
export const studyShifts = [SHIFT_MORNING, SHIFT_AFTERNOON, SHIFT_FULL_DAY];

const classCodes = gradeLevels.flatMap((grade) =>
  classSections.map((section) => `${grade}${section}`)
);

export const DEFAULT_CLASS_CODE = classCodes[0];
export const DEFAULT_SECTION = 'A';
export const DEFAULT_SHIFT = SHIFT_MORNING;

export const normalizeShift = (shift) => {
  const s = String(shift || '').trim().toLowerCase();
  if (s.includes('morn') || s.includes('ព្រឹក')) return SHIFT_MORNING;
  if (s.includes('after') || s.includes('រសៀល')) return SHIFT_AFTERNOON;
  if (s.includes('full') || s.includes('ពេញ')) return SHIFT_FULL_DAY;
  return SHIFT_MORNING;
};

// ---------------------------------------------------------------------------
// MoEYS Conduct Rating Scale (A/B/C/D)
// ---------------------------------------------------------------------------

export const CONDUCT_A = 'A';
export const CONDUCT_B = 'B';
export const CONDUCT_C = 'C';
export const CONDUCT_D = 'D';

export const CONDUCT_LABELS = {
  [CONDUCT_A]: 'ល្អប្រសើរ (Excellent)',
  [CONDUCT_B]: 'ល្អ (Good)',
  [CONDUCT_C]: 'មធ្យម (Fair)',
  [CONDUCT_D]: 'ត្រូវកែលម្អ (Needs Improvement)',
};

export const conductOptions = [
  { value: CONDUCT_A, label: CONDUCT_LABELS[CONDUCT_A] },
  { value: CONDUCT_B, label: CONDUCT_LABELS[CONDUCT_B] },
  { value: CONDUCT_C, label: CONDUCT_LABELS[CONDUCT_C] },
  { value: CONDUCT_D, label: CONDUCT_LABELS[CONDUCT_D] },
];

/** Normalize legacy string-based conduct to MoEYS letter scale */
export const normalizeConductLegacy = (conduct) => {
  const s = String(conduct || '').toLowerCase().trim();
  if (s === 'excellent' || s === 'a' || s === 'ល្អប្រសើរ') return CONDUCT_A;
  if (s === 'good' || s === 'b' || s === 'ល្អ') return CONDUCT_B;
  if (s === 'medium' || s === 'fair' || s === 'c' || s === 'មធ្យម') return CONDUCT_C;
  if (s === 'poor' || s === 'd' || s === 'ត្រូវកែលម្អ') return CONDUCT_D;
  return CONDUCT_B; // default
};

// ---------------------------------------------------------------------------
// Sample MoEYS Students (updated schema)
// ---------------------------------------------------------------------------

export const sampleMoEYSStudents = [
  {
    id: '1',
    studentId: 'KH-STU-001',
    name: 'Sok Piseth',
    nameKhmer: 'សុខ ពិសិដ្ឋ',
    nameLatin: 'Sok Piseth',
    rollNo: '01',
    class: '10A',
    shift: SHIFT_MORNING,
    gender: 'male',
    dateOfBirth: '2009-04-12',
    phone: '012 345 678',
    conduct: CONDUCT_A,
    // Parent / Guardian info
    parentName: 'សុខ សំណាង',
    parentPhone: '012 111 222',
    address: 'ភូមិ ព្រែកឯក, ស្រុក ដង្កោ, រាជធានីភ្នំពេញ',
    provinceName: 'ភ្នំពេញ',
    academicYear: '2024-2025',
  },
  {
    id: '2',
    studentId: 'KH-STU-002',
    name: 'Chan Thida',
    nameKhmer: 'ចាន់ ធីតា',
    nameLatin: 'Chan Thida',
    rollNo: '02',
    class: '10A',
    shift: SHIFT_MORNING,
    gender: 'female',
    dateOfBirth: '2009-08-20',
    phone: '015 889 900',
    conduct: CONDUCT_A,
    parentName: 'ចាន់ ប៊ុនថន',
    parentPhone: '015 333 444',
    address: 'ភូមិ ត្រព្រែង, ខណ្ឌ ច្បារអំពៅ, រាជធានីភ្នំពេញ',
    provinceName: 'ភ្នំពេញ',
    academicYear: '2024-2025',
  },
  {
    id: '3',
    studentId: 'KH-STU-003',
    name: 'Heng Veasna',
    nameKhmer: 'ហេង វាសនា',
    nameLatin: 'Heng Veasna',
    rollNo: '03',
    class: '10A',
    shift: SHIFT_MORNING,
    gender: 'male',
    dateOfBirth: '2009-02-15',
    phone: '098 765 432',
    conduct: CONDUCT_B,
    parentName: 'ហេង ស្រីណា',
    parentPhone: '098 555 666',
    address: 'ភូមិ ស្ទឹងមានជ័យ, ស្រុក ស្ទឹងមានជ័យ, ខេត្តកណ្តាល',
    provinceName: 'កណ្តាល',
    academicYear: '2024-2025',
  },
  {
    id: '4',
    studentId: 'KH-STU-004',
    name: 'Ly Sreymao',
    nameKhmer: 'លី ស្រីម៉ៅ',
    nameLatin: 'Ly Sreymao',
    rollNo: '04',
    class: '10A',
    shift: SHIFT_AFTERNOON,
    gender: 'female',
    dateOfBirth: '2009-11-05',
    phone: '077 112 233',
    conduct: CONDUCT_B,
    parentName: 'លី ស្រីពេជ្រ',
    parentPhone: '077 999 000',
    address: 'ភូមិ ទ្រាំង, ស្រុក កណ្តាល, ខេត្តកណ្តាល',
    provinceName: 'កណ្តាល',
    academicYear: '2024-2025',
  },
  {
    id: '5',
    studentId: 'KH-STU-005',
    name: 'Kong Vannak',
    nameKhmer: 'គង់ វណ្ណៈ',
    nameLatin: 'Kong Vannak',
    rollNo: '05',
    class: '10A',
    shift: SHIFT_AFTERNOON,
    gender: 'male',
    dateOfBirth: '2009-06-30',
    phone: '089 445 566',
    conduct: CONDUCT_C,
    parentName: 'គង់ ស្រីណុច',
    parentPhone: '089 777 888',
    address: 'ភូមិ ស្ទួច, ស្រុក ព្រែកស្ដាច, ខេត្តកណ្តាល',
    provinceName: 'កណ្តាល',
    academicYear: '2024-2025',
  },
  {
    id: '6',
    studentId: 'KH-STU-006',
    name: 'Sorn Sopheap',
    nameKhmer: 'ស៊ន សុភាព',
    nameLatin: 'Sorn Sopheap',
    rollNo: '06',
    class: '10A',
    shift: SHIFT_MORNING,
    gender: 'female',
    dateOfBirth: '2009-09-18',
    phone: '097 554 433',
    conduct: CONDUCT_A,
    parentName: 'ស៊ន ស្រីពន្លឺ',
    parentPhone: '097 123 456',
    address: 'ភូមិ ចំការដូង, ខណ្ឌ ទួលគោក, រាជធានីភ្នំពេញ',
    provinceName: 'ភ្នំពេញ',
    academicYear: '2024-2025',
  },
];

export const studentsData = sampleMoEYSStudents;

export function getInitialStudents() {
  try {
    const raw = localStorage.getItem('students_local_v2');
    if (!raw) {
      localStorage.setItem('students_local_v2', JSON.stringify(sampleMoEYSStudents));
      return sampleMoEYSStudents;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Migrate legacy conduct strings to MoEYS letter scale
      return parsed.map((s) => ({
        ...s,
        conduct: normalizeConductLegacy(s.conduct),
        academicYear: s.academicYear || '2024-2025',
      }));
    }
    return sampleMoEYSStudents;
  } catch {
    return sampleMoEYSStudents;
  }
}

export const classOptions = [
  { value: '', label: 'Select Class' },
  ...classCodes.map((code) => ({ value: code, label: `Class ${code}` })),
];

export const subjectOptions = [
  { value: '', label: 'Select Subject / ជ្រើសរើសមុខវិជ្ជា' },
  { value: 'khmer', label: 'ភាសាខ្មែរ (Khmer Language & Literature)' },
  { value: 'mathematics', label: 'គណិតវិទ្យា (Mathematics)' },
  { value: 'physics', label: 'រូបវិទ្យា (Physics)' },
  { value: 'chemistry', label: 'គីមីវិទ្យា (Chemistry)' },
  { value: 'biology', label: 'ជីវវិទ្យា (Biology)' },
  { value: 'earth-science', label: 'ផែនដី និងបរិស្ថាន (Earth & Environmental Science)' },
  { value: 'english', label: 'ភាសាអង់គ្លេស (English)' },
  { value: 'french', label: 'ភាសាបារាំង (French)' },
  { value: 'history', label: 'ប្រវត្តិវិទ្យា (History)' },
  { value: 'geography', label: 'ភូមិវិទ្យា (Geography)' },
  { value: 'moral-civics', label: 'សីលធម៌-ពលរដ្ឋវិជ្ជា (Civics and Morality)' },
  { value: 'social-studies', label: 'វិទ្យាសាស្ត្រសង្គម (Social Studies)' },
  { value: 'computer', label: 'បច្ចេកវិទ្យាព័ត៌មាន (Digital Literacy / ICT)' },
  { value: 'physical-education', label: 'អប់រំកាយ និងកីឡា (Physical Education & Sports)' },
];

export const DEFAULT_SUBJECT_VALUE = 'mathematics';
export const DEFAULT_SUBJECT_LABEL =
  subjectOptions.find((item) => item.value === DEFAULT_SUBJECT_VALUE)?.label || 'Mathematics';

export const shiftOptions = [
  { value: '', label: 'Select Shift / ជ្រើសរើសវេន' },
  { value: SHIFT_MORNING, label: 'Morning Shift (វេនព្រឹក • 7:00 - 11:00 AM)' },
  { value: SHIFT_AFTERNOON, label: 'Afternoon Shift (វេនរសៀល • 1:00 - 5:00 PM)' },
  { value: SHIFT_FULL_DAY, label: 'Full Day (ពេញមួយថ្ងៃ)' },
];

export const sectionOptions = [
  { value: '', label: 'Select Section' },
  { value: 'A', label: 'Section A' },
  { value: 'B', label: 'Section B' },
  { value: 'C', label: 'Section C' },
];
