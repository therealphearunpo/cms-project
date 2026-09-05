import { mergeUniqueStudents, mergeUniqueTeachers } from '../../utils/students';

describe('mergeUniqueStudents', () => {
  it('deduplicates students by id (last-write-wins)', () => {
    const list = [
      { id: '1', name: 'John Doe', class: '10A' },
      { id: '1', name: 'John Doe Updated', class: '10A' },
    ];
    const result = mergeUniqueStudents(list);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('John Doe Updated');
  });

  it('deduplicates by studentId when id is missing', () => {
    const list = [
      { studentId: 'STU001', name: 'Jane' },
      { studentId: 'STU001', name: 'Jane Doe' },
    ];
    const result = mergeUniqueStudents(list);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Jane Doe');
  });

  it('deduplicates by case-insensitive email when id/studentId are missing', () => {
    const list = [
      { email: 'Test@School.edu', name: 'Student 1' },
      { email: 'test@school.edu', name: 'Student 2' },
    ];
    const result = mergeUniqueStudents(list);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Student 2');
  });

  it('handles invalid or empty inputs gracefully', () => {
    expect(mergeUniqueStudents([])).toEqual([]);
    expect(mergeUniqueStudents([null, undefined, 'string', { id: '1', name: 'Valid' }])).toHaveLength(1);
  });
});

describe('mergeUniqueTeachers', () => {
  it('deduplicates teachers by employeeId', () => {
    const list = [
      { employeeId: 'EMP01', name: 'Prof A' },
      { employeeId: 'EMP01', name: 'Prof A Updated' },
    ];
    const result = mergeUniqueTeachers(list);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Prof A Updated');
  });

  it('handles empty and invalid items gracefully', () => {
    expect(mergeUniqueTeachers([])).toEqual([]);
    expect(mergeUniqueTeachers([null, undefined])).toEqual([]);
  });
});
