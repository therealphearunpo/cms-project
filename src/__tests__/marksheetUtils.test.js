import {
  computeClassRankings,
  getGradeFromAverage,
  getGradeBadgeColor,
} from '../components/Marksheets/marksheetUtils';

describe('MoEYS marksheets grading logic', () => {
  it('correctly maps scores to MoEYS standard grades', () => {
    expect(getGradeFromAverage(95)).toBe('A');
    expect(getGradeFromAverage(85)).toBe('A');
    expect(getGradeFromAverage(84)).toBe('B');
    expect(getGradeFromAverage(75)).toBe('B');
    expect(getGradeFromAverage(70)).toBe('C');
    expect(getGradeFromAverage(65)).toBe('C');
    expect(getGradeFromAverage(62)).toBe('D');
    expect(getGradeFromAverage(55)).toBe('E');
    expect(getGradeFromAverage(50)).toBe('E');
    expect(getGradeFromAverage(45)).toBe('F');
    expect(getGradeFromAverage(null)).toBe('-');
  });

  it('provides appropriate badge styling for grades', () => {
    expect(getGradeBadgeColor('A')).toContain('emerald');
    expect(getGradeBadgeColor('B')).toContain('blue');
    expect(getGradeBadgeColor('F')).toContain('rose');
  });

  it('correctly computes class rank positions', () => {
    const rows = [
      { studentId: '1', name: 'Student 1', avg: 70 },
      { studentId: '2', name: 'Student 2', avg: 90 },
      { studentId: '3', name: 'Student 3', avg: 85 },
      { studentId: '4', name: 'Student 4', avg: null },
    ];

    const ranked = computeClassRankings(rows);
    const map = Object.fromEntries(ranked.map((r) => [r.studentId, r.rank]));

    expect(map['2']).toBe(1); // 90 -> 1st
    expect(map['3']).toBe(2); // 85 -> 2nd
    expect(map['1']).toBe(3); // 70 -> 3rd
    expect(map['4']).toBe('-'); // No score
  });
});
