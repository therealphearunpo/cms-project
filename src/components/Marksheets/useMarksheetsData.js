import { useEffect, useState } from 'react';

import {
  getMarksheetStorageKey,
  LOCAL_STUDENTS_KEY,
  normalizeScoreMap,
  normalizeStudent,
  safeReadJson,
  uniqueStudents,
} from './marksheetUtils';
import { CURRENT_ACADEMIC_YEAR, SEMESTER_1 } from '../../data/academicCalendar';
import { marksheetsAPI, studentsAPI } from '../../services/api';

export default function useMarksheetsData(
  semester = SEMESTER_1,
  academicYear = CURRENT_ACADEMIC_YEAR
) {
  const [students, setStudents] = useState([]);
  const [marksByStudent, setMarksByStudent] = useState({});
  const [loading, setLoading] = useState(true);

  const storageKey = getMarksheetStorageKey(semester, academicYear);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const localStudents = safeReadJson(LOCAL_STUDENTS_KEY, []).map(normalizeStudent);

      let mergedStudents;
      try {
        const response = await studentsAPI.getAll();
        const apiStudents = Array.isArray(response?.data) ? response.data : [];
        mergedStudents = uniqueStudents([...localStudents, ...apiStudents.map(normalizeStudent)]);
      } catch {
        mergedStudents = uniqueStudents(localStudents);
      }

      let apiScores = {};
      try {
        const response = await marksheetsAPI.getAll();
        const payload = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.items)
            ? response.data.items
            : response?.data;
        apiScores = normalizeScoreMap(payload);
      } catch {
        apiScores = {};
      }

      // Load semester-scoped local scores
      const localScores = normalizeScoreMap(safeReadJson(storageKey, {}));
      setStudents(mergedStudents);
      setMarksByStudent({ ...apiScores, ...localScores });
      setLoading(false);
    };

    loadData();
  }, [semester, academicYear, storageKey]);

  return {
    students,
    marksByStudent,
    setMarksByStudent,
    loading,
    storageKey,
  };
}
