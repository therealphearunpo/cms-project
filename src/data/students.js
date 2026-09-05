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
    conduct: 'excellent',
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
    conduct: 'excellent',
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
    conduct: 'good',
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
    conduct: 'good',
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
    conduct: 'medium',
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
    conduct: 'excellent',
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
      return parsed;
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
  { value: 'khmer', label: 'Khmer Language & Literature (ភាសាខ្មែរ)' },
  { value: 'mathematics', label: 'Mathematics (គណិតវិទ្យា)' },
  { value: 'physics', label: 'Physics (រូបវិទ្យា)' },
  { value: 'chemistry', label: 'Chemistry (គីមីវិទ្យា)' },
  { value: 'biology', label: 'Biology (ជីវវិទ្យា)' },
  { value: 'earth-science', label: 'Earth & Environmental Science (ផែនដី និងបរិស្ថាន)' },
  { value: 'english', label: 'English (ភាសាអង់គ្លេស)' },
  { value: 'french', label: 'French (ភាសាបារាំង)' },
  { value: 'history', label: 'History (ប្រវត្តិវិទ្យា)' },
  { value: 'geography', label: 'Geography (ភូមិវិទ្យា)' },
  { value: 'moral-civics', label: 'Civics and Morality (សីលធម៌-ពលរដ្ឋវិជ្ជា)' },
  { value: 'social-studies', label: 'Social Studies (វិទ្យាសាស្ត្រសង្គម)' },
  { value: 'computer', label: 'Digital Literacy / ICT (បច្ចេកវិទ្យាព័ត៌មាន)' },
  { value: 'physical-education', label: 'Physical Education & Sports (អប់រំកាយ និងកីឡា)' },
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
