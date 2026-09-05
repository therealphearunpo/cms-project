import React, { useMemo, useState } from 'react';

import EditMarksheetModal from './EditMarksheetModal';
import createMarksheetColumns from './marksheetColumns';
import MarksheetFilters from './MarksheetFilters';
import MarksheetStats from './MarksheetStats';
import {
  clampScore,
  computeSubjectScore,
  emptyScoreEntry,
  getGradeFromAverage,
  saveJson,
  SUBJECTS,
} from './marksheetUtils';
import PrintGradeBook from './PrintGradeBook';
import useMarksheetsData from './useMarksheetsData';
import { ACCOUNT_ROLES, normalizeRole } from '../../constants/roles';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  academicYearOptions,
  CURRENT_ACADEMIC_YEAR,
  getCurrentSemester,
  SEMESTER_1,
  semesterOptions,
} from '../../data/academicCalendar';
import { marksheetsAPI } from '../../services/api';
import DataTable from '../common/DataTable';

export default function MarksheetsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const role = normalizeRole(user?.role);
  const isStudent = role === ACCOUNT_ROLES.STUDENT;
  const canEditMarks = role === ACCOUNT_ROLES.ADMIN;
  const studentClassCode = String(user?.class || '').trim();

  // --- Semester & Academic Year selectors ---
  const [semester, setSemester] = useState(() => getCurrentSemester());
  const [academicYear, setAcademicYear] = useState(CURRENT_ACADEMIC_YEAR);

  const { students, marksByStudent, setMarksByStudent, loading, storageKey } = useMarksheetsData(
    semester,
    academicYear
  );

  const [notification, setNotification] = useState(null);
  const [selectedClass, setSelectedClass] = useState(studentClassCode || 'ALL');
  const [editing, setEditing] = useState(null);
  const [formScores, setFormScores] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showPrint, setShowPrint] = useState(false);

  const filteredStudents = useMemo(() => {
    const lockedClass = isStudent && studentClassCode ? studentClassCode : null;
    return students.filter((student) =>
      lockedClass
        ? student.class === lockedClass
        : selectedClass === 'ALL' || student.class === selectedClass
    );
  }, [isStudent, selectedClass, studentClassCode, students]);

  const rows = useMemo(() => {
    const baseRows = filteredStudents.map((student) => {
      const studentId = String(student.id);
      const scores = marksByStudent[studentId] || null;
      const hasScores = Boolean(scores);

      // Build per-subject computed averages
      const subjectAverages = SUBJECTS.reduce((acc, subject) => {
        acc[subject] = hasScores ? computeSubjectScore(scores[subject]) : '';
        return acc;
      }, {});

      const total = hasScores
        ? SUBJECTS.reduce((sum, subject) => sum + Number(subjectAverages[subject] || 0), 0)
        : null;
      const avg = hasScores ? Number((total / SUBJECTS.length).toFixed(1)) : null;
      const grade = hasScores ? getGradeFromAverage(avg) : '';

      return {
        id: student.id,
        studentId,
        name: student.name,
        nameKhmer: student.nameKhmer || student.name,
        nameLatin: student.nameLatin || student.name,
        class: student.class,
        shift: student.shift,
        rollNo: student.rollNo,
        conduct: student.conduct,
        ...subjectAverages,
        // Also keep raw dual-score entries for modal editing
        _rawScores: scores,
        hasScores,
        total,
        avg,
        grade,
      };
    });

    // Compute dense rank by avg
    const ranked = [...baseRows]
      .filter((row) => row.hasScores)
      .sort((a, b) => {
        if (b.avg !== a.avg) return b.avg - a.avg;
        if (b.total !== a.total) return b.total - a.total;
        return String(a.name).localeCompare(String(b.name));
      });

    const rankByStudentId = {};
    let prevKey = null;
    let currentRank = 0;
    ranked.forEach((row, index) => {
      const key = `${row.avg}-${row.total}`;
      if (key !== prevKey) {
        currentRank = index + 1;
        prevKey = key;
      }
      rankByStudentId[row.studentId] = currentRank;
    });

    return baseRows.map((row) => ({
      ...row,
      rank: row.hasScores ? rankByStudentId[row.studentId] : '',
    }));
  }, [filteredStudents, marksByStudent]);

  const stats = useMemo(() => {
    const gradedRows = rows.filter((row) => row.hasScores);
    if (gradedRows.length === 0) return { students: 0, avg: 0, passRate: 0 };
    const avg = gradedRows.reduce((sum, row) => sum + row.avg, 0) / gradedRows.length;
    const passCount = gradedRows.filter((row) => row.avg >= 50).length;
    return {
      students: gradedRows.length,
      avg: avg.toFixed(1),
      passRate: ((passCount / gradedRows.length) * 100).toFixed(1),
    };
  }, [rows]);

  const openEditModal = (row) => {
    setEditing(row);
    // Populate form with existing dual-score entries (or empty)
    const initial = SUBJECTS.reduce((acc, subject) => {
      const raw = row._rawScores?.[subject];
      if (raw && typeof raw === 'object') {
        acc[subject] = { monthly: clampScore(raw.monthly), exam: clampScore(raw.exam) };
      } else if (raw != null) {
        // Legacy single number — treat as both monthly and exam
        const n = clampScore(raw);
        acc[subject] = { monthly: n, exam: n };
      } else {
        acc[subject] = emptyScoreEntry();
      }
      return acc;
    }, {});
    setFormScores(initial);
  };

  const closeEditModal = () => {
    if (isSaving) return;
    setEditing(null);
    setFormScores({});
  };

  const handleSaveScores = async (event) => {
    event.preventDefault();
    if (!editing) return;

    // Store dual-score objects
    const nextScores = SUBJECTS.reduce((acc, subject) => {
      const entry = formScores[subject] || emptyScoreEntry();
      acc[subject] = {
        monthly: clampScore(entry.monthly),
        exam: clampScore(entry.exam),
      };
      return acc;
    }, {});

    const nextMap = {
      ...marksByStudent,
      [String(editing.studentId)]: nextScores,
    };

    setIsSaving(true);
    try {
      await marksheetsAPI.update(editing.studentId, {
        studentId: editing.studentId,
        studentName: editing.name,
        semester,
        academicYear,
        scores: nextScores,
      });
      setNotification({ type: 'success', message: 'Marksheet updated successfully.' });
    } catch {
      setNotification({
        type: 'success',
        message: 'Marksheet saved locally (API unavailable).',
      });
    } finally {
      setMarksByStudent(nextMap);
      saveJson(storageKey, nextMap);
      setIsSaving(false);
      closeEditModal();
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const columns = useMemo(
    () => createMarksheetColumns({ canEditMarks, subjects: SUBJECTS, openEditModal }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canEditMarks]
  );

  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            notification.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {t('marksheets.title', 'MoEYS Academic Gradebook')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t(
              'marksheets.subtitle',
              'Student score recording, class ranking, and semester evaluations'
            )}
          </p>
        </div>

        {/* Print button */}
        {canEditMarks && (
          <button
            type="button"
            onClick={() => setShowPrint(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex-shrink-0 self-start"
          >
            🖨️ {t('common.print', 'Print Grade Book')} (បញ្ជីពិន្ទុ)
          </button>
        )}
      </div>

      {/* Semester & Academic Year selectors */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <label
            htmlFor="semester-select"
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap"
          >
            វគ្គ (Semester):
          </label>
          <select
            id="semester-select"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {semesterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="year-select"
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap"
          >
            ឆ្នាំសិក្សា (Year):
          </label>
          <select
            id="year-select"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {academicYearOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Semester badge */}
        <div className="ml-auto flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
            📚 {semester === SEMESTER_1 ? 'វគ្គ ១' : 'វគ្គ ២'} · {academicYear}
          </span>
        </div>
      </div>

      <MarksheetStats stats={stats} />

      <MarksheetFilters
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        isStudent={isStudent}
      />

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        searchable
        exportable
        itemsPerPage={30}
      />

      <EditMarksheetModal
        canEditMarks={canEditMarks}
        editing={editing}
        closeEditModal={closeEditModal}
        handleSaveScores={handleSaveScores}
        formScores={formScores}
        setFormScores={setFormScores}
        isSaving={isSaving}
      />

      {/* Print Grade Book Modal */}
      <PrintGradeBook
        rows={rows}
        selectedClass={selectedClass === 'ALL' ? null : selectedClass}
        semester={semester}
        academicYear={academicYear}
        isOpen={showPrint}
        onClose={() => setShowPrint(false)}
      />
    </div>
  );
}
