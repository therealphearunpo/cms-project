import React, { useEffect, useMemo, useState } from 'react';

import { HiOutlinePencil, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';

import { isFrontendOnly } from '../../config/appMode.js';
import { useLanguage } from '../../context/LanguageContext';
import {
  classOptions,
  DEFAULT_CLASS_CODE,
  DEFAULT_SHIFT,
  getInitialStudents,
  normalizeShift,
  shiftOptions,
} from '../../data/students';
import { studentsAPI } from '../../services/api';
import { generateAvatarByGender, normalizeGender } from '../../utils/avatar';
import { makeStudentEmail } from '../../utils/studentAuth';
import { mergeUniqueStudents } from '../../utils/students';
import Badge from '../common/Badge';
import Button from '../common/Button';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';

const LOCAL_STUDENTS_KEY = 'students_local_v2';
const EMPTY_FORM = {
  studentId: '',
  name: '',
  nameKhmer: '',
  nameLatin: '',
  class: DEFAULT_CLASS_CODE,
  shift: DEFAULT_SHIFT,
  gender: 'male',
  dateOfBirth: '',
  conduct: 'excellent',
};

function readLocalStudents() {
  return getInitialStudents();
}

function saveLocalStudents(students) {
  try {
    localStorage.setItem(LOCAL_STUDENTS_KEY, JSON.stringify(students));
  } catch (_error) {
    // Ignore storage errors.
  }
}

function normalizeStudentRecord(student, fallbackId = null) {
  const id = student?.id ?? fallbackId ?? `local-${Date.now()}`;
  const nameKhmer = String(student?.nameKhmer ?? '').trim();
  const nameLatin = String(student?.nameLatin ?? '').trim();
  const name = String(student?.name ?? (nameKhmer || nameLatin || student?.full_name || '')).trim();
  const classCode = String(student?.class ?? student?.class_name ?? '')
    .trim()
    .toUpperCase();
  const gender = normalizeGender(student?.gender, 'male');
  const email = String(student?.email || '').trim();
  const studentId = String(student?.studentId ?? student?.student_code ?? '').trim();
  const conduct = String(student?.conduct || 'excellent').toLowerCase();

  return {
    ...student,
    id,
    studentId,
    name: name || nameKhmer || nameLatin,
    nameKhmer: nameKhmer || name,
    nameLatin: nameLatin || name,
    class: classCode,
    shift: normalizeShift(student?.shift),
    gender,
    email,
    conduct,
    dateOfBirth: String(student?.dateOfBirth ?? student?.dob ?? '').trim(),
    avatar:
      student?.avatar ||
      generateAvatarByGender(email || studentId || name || `student-${id}`, gender),
    isLocalOnly: Boolean(student?.isLocalOnly) || String(id).startsWith('local-'),
    status: student?.status || 'active',
  };
}

function formatDateOfBirth(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('en-GB').format(date);
}

export default function StudentsPage() {
  const { t } = useLanguage();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedShift, setSelectedShift] = useState('ALL');
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      const localStudents = readLocalStudents().map((student, index) =>
        normalizeStudentRecord(student, index + 1)
      );

      if (isFrontendOnly()) {
        setStudents(localStudents);
        saveLocalStudents(localStudents);
        setLoading(false);
        return;
      }

      try {
        const response = await studentsAPI.getAll();
        const apiStudents = Array.isArray(response?.data) ? response.data : [];
        const merged = mergeUniqueStudents([
          ...apiStudents,
          ...localStudents.filter((student) => student.isLocalOnly),
        ]);
        setStudents(merged);
        saveLocalStudents(merged);
      } catch (_error) {
        setStudents(localStudents);
        saveLocalStudents(localStudents);
        setNotification({
          type: 'warning',
          message: 'Student API is unavailable. Showing locally cached records only.',
        });
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  useEffect(() => {
    if (!notification) return undefined;
    const timer = window.setTimeout(() => setNotification(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notification]);

  const stats = useMemo(() => {
    const activeStudents = students.filter((student) => student.status !== 'alumni');
    const classSet = new Set(activeStudents.map((student) => student.class).filter(Boolean));
    return {
      total: activeStudents.length,
      classes: classSet.size,
      morning: activeStudents.filter((s) => s.shift === 'Morning').length,
      afternoon: activeStudents.filter((s) => s.shift === 'Afternoon').length,
    };
  }, [students]);

  const classFilterOptions = useMemo(
    () => classOptions.filter((opt) => opt.value).map((opt) => opt.value),
    []
  );

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchClass = selectedClass === 'ALL' || student.class === selectedClass;
      const matchShift = selectedShift === 'ALL' || student.shift === selectedShift;
      return matchClass && matchShift;
    });
  }, [selectedClass, selectedShift, students]);

  const columns = useMemo(
    () => [
      {
        header: 'Student / ឈ្មោះសិស្ស',
        accessor: 'name',
        sortable: true,
        render: (_value, row) => (
          <div className="flex items-center gap-3">
            <img
              src={row.avatar}
              alt={row.name}
              className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-700 object-cover flex-shrink-0"
            />
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-xs leading-tight">
                {row.nameKhmer || row.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {row.nameLatin || row.name} • {row.studentId || 'No ID'}
              </p>
            </div>
          </div>
        ),
      },
      {
        header: 'Class / ថ្នាក់',
        accessor: 'class',
        sortable: true,
        render: (value) => <span className="font-mono text-xs font-semibold">{value}</span>,
      },
      {
        header: 'Shift / វេន',
        accessor: 'shift',
        sortable: true,
        render: (value) => {
          const isMorning = value === 'Morning';
          return (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                isMorning
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                  : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20'
              }`}
            >
              <span>{isMorning ? '🌅' : '🌇'}</span>
              <span>{isMorning ? 'ព្រឹក' : 'រសៀល'}</span>
            </span>
          );
        },
      },
      {
        header: 'Gender / ភេទ',
        accessor: 'gender',
        sortable: true,
        render: (value) => (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
              value === 'female'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
            }`}
          >
            {value === 'female' ? 'ស្រី' : 'ប្រុស'}
          </span>
        ),
      },
      {
        header: 'Conduct / សីលធម៌',
        accessor: 'conduct',
        sortable: true,
        render: (value) => {
          const conductMap = {
            excellent: { label: 'ល្អប្រសើរ', variant: 'success' },
            good: { label: 'ល្អ', variant: 'info' },
            medium: { label: 'មធ្យម', variant: 'warning' },
            poor: { label: 'កែលម្អ', variant: 'danger' },
          };
          const item = conductMap[value] || conductMap.good;
          return <Badge variant={item.variant}>{item.label}</Badge>;
        },
      },
      {
        header: 'Date of Birth',
        accessor: 'dateOfBirth',
        sortable: true,
        render: (value) => <span className="font-mono text-xs">{formatDateOfBirth(value)}</span>,
      },
      {
        header: 'Actions',
        accessor: 'actions',
        render: (_value, row) => (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={HiOutlinePencil}
              onClick={() => {
                setEditingStudent(row);
                setFormData({
                  studentId: row.studentId || '',
                  name: row.name || '',
                  nameKhmer: row.nameKhmer || row.name || '',
                  nameLatin: row.nameLatin || row.name || '',
                  class: row.class || DEFAULT_CLASS_CODE,
                  shift: row.shift || DEFAULT_SHIFT,
                  gender: row.gender || 'male',
                  dateOfBirth: row.dateOfBirth || '',
                  conduct: row.conduct || 'excellent',
                });
                setIsCreateOpen(true);
              }}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={HiOutlineTrash}
              onClick={() => setDeletingStudent(row)}
            >
              Remove
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingStudent(null);
    setIsCreateOpen(false);
  };

  const upsertStudent = (student) => {
    const normalized = normalizeStudentRecord(student);
    setStudents((prev) => {
      const exists = prev.some((item) => String(item.id) === String(normalized.id));
      const next = exists
        ? prev.map((item) => (String(item.id) === String(normalized.id) ? normalized : item))
        : [normalized, ...prev];
      saveLocalStudents(next);
      return next;
    });
  };

  const removeStudent = (studentId) => {
    setStudents((prev) => {
      const next = prev.filter((item) => String(item.id) !== String(studentId));
      saveLocalStudents(next);
      return next;
    });
  };

  const handleCreateOrUpdateStudent = async (event) => {
    event.preventDefault();
    const payload = {
      studentId: formData.studentId.trim(),
      name: (formData.nameKhmer || formData.name || formData.nameLatin).trim(),
      nameKhmer: formData.nameKhmer.trim(),
      nameLatin: formData.nameLatin.trim(),
      class: formData.class,
      shift: formData.shift,
      gender: normalizeGender(formData.gender, 'male'),
      dateOfBirth: formData.dateOfBirth || '',
      conduct: formData.conduct || 'excellent',
    };

    if (!payload.nameKhmer && !payload.name) {
      setNotification({ type: 'error', message: 'Student name is required.' });
      return;
    }

    setIsSaving(true);

    const buildLocalStudent = () =>
      normalizeStudentRecord({
        ...payload,
        id: editingStudent?.id || `local-${Date.now()}`,
        isLocalOnly: true,
        email: makeStudentEmail(payload.nameLatin || payload.name, payload.class),
        status: 'active',
      });

    try {
      const response = editingStudent
        ? editingStudent.isLocalOnly
          ? await studentsAPI.create(payload)
          : await studentsAPI.update(editingStudent.id, payload)
        : await studentsAPI.create(payload);

      if (editingStudent?.isLocalOnly) {
        removeStudent(editingStudent.id);
        upsertStudent(
          response?.data && typeof response.data === 'object' ? response.data : buildLocalStudent()
        );
        setNotification({
          type: 'success',
          message: 'Student record saved successfully.',
        });
      } else {
        upsertStudent(
          response?.data && typeof response.data === 'object' ? response.data : buildLocalStudent()
        );
        setNotification({
          type: 'success',
          message: editingStudent ? 'Student updated successfully.' : 'Student created successfully.',
        });
      }
      resetForm();
    } catch (_error) {
      upsertStudent(buildLocalStudent());
      setNotification({
        type: 'success',
        message: 'Saved student record to local cache.',
      });
      resetForm();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deletingStudent) return;
    setIsDeleting(true);
    try {
      if (!deletingStudent.isLocalOnly) {
        await studentsAPI.delete(deletingStudent.id);
      }
      removeStudent(deletingStudent.id);
      setNotification({ type: 'success', message: 'Student removed successfully.' });
      setDeletingStudent(null);
    } catch (_error) {
      removeStudent(deletingStudent.id);
      setNotification({
        type: 'success',
        message: 'Student removed from local storage.',
      });
      setDeletingStudent(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={`rounded-xl px-4 py-3 text-sm border ${
            notification.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
              : notification.type === 'warning'
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {t('students.title', 'Student Directory')}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t(
              'students.subtitle',
              'Manage enrolled students, MoEYS records, and personal profiles'
            )}
          </p>
        </div>
        <Button
          icon={HiOutlinePlus}
          onClick={() => {
            setEditingStudent(null);
            setFormData(EMPTY_FORM);
            setIsCreateOpen(true);
          }}
        >
          {t('students.add_student', 'Add Student')}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center">
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{stats.total}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Total Enrolled</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center">
          <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
            {stats.classes}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Active Classes</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center">
          <p className="text-2xl font-bold font-mono text-amber-500">{stats.morning}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Morning Shift (ព្រឹក)</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center">
          <p className="text-2xl font-bold font-mono text-indigo-500">{stats.afternoon}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Afternoon Shift (រសៀល)</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-44">
            <label htmlFor="students-class-filter" className="sr-only">
              Filter by class
            </label>
            <select
              id="students-class-filter"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Classes / គ្រប់ថ្នាក់</option>
              {classFilterOptions.map((value) => (
                <option key={value} value={value}>
                  Class {value}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-44">
            <label htmlFor="students-shift-filter" className="sr-only">
              Filter by shift
            </label>
            <select
              id="students-shift-filter"
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Shifts / គ្រប់វេន</option>
              <option value="Morning">Morning (វេនព្រឹក)</option>
              <option value="Afternoon">Afternoon (វេនរសៀល)</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Showing {filteredStudents.length} student{filteredStudents.length === 1 ? '' : 's'}
        </p>
      </div>

      <DataTable
        columns={columns}
        data={filteredStudents}
        loading={loading}
        searchable={true}
        exportable={true}
        itemsPerPage={20}
      />

      <Modal
        isOpen={isCreateOpen}
        onClose={() => !isSaving && resetForm()}
        title={editingStudent ? t('students.edit_student', 'Edit Student') : t('students.add_student', 'Register Student')}
      >
        <form onSubmit={handleCreateOrUpdateStudent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="student-name-khmer"
                className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Khmer Name (ឈ្មោះជាភាសាខ្មែរ) *
              </label>
              <input
                id="student-name-khmer"
                type="text"
                value={formData.nameKhmer}
                onChange={(e) => setFormData((prev) => ({ ...prev, nameKhmer: e.target.value }))}
                placeholder="ឧ. សុខ ពិសិដ្ឋ"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="student-name-latin"
                className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Latin Name (ឈ្មោះឡាតាំង)
              </label>
              <input
                id="student-name-latin"
                type="text"
                value={formData.nameLatin}
                onChange={(e) => setFormData((prev) => ({ ...prev, nameLatin: e.target.value }))}
                placeholder="e.g. Sok Piseth"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="student-id"
                className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                MoEYS / Student Code (អត្តលេខសិស្ស)
              </label>
              <input
                id="student-id"
                type="text"
                value={formData.studentId}
                onChange={(e) => setFormData((prev) => ({ ...prev, studentId: e.target.value }))}
                placeholder="KH-STU-001"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="student-class"
                className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Class (កម្រិតថ្នាក់) *
              </label>
              <select
                id="student-class"
                value={formData.class}
                onChange={(e) => setFormData((prev) => ({ ...prev, class: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {classOptions
                  .filter((opt) => opt.value)
                  .map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.value}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="student-shift"
                className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Study Shift (វេនសិក្សា)
              </label>
              <select
                id="student-shift"
                value={formData.shift}
                onChange={(e) => setFormData((prev) => ({ ...prev, shift: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {shiftOptions
                  .filter((opt) => opt.value)
                  .map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="student-gender"
                className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Gender (ភេទ)
              </label>
              <select
                id="student-gender"
                value={formData.gender}
                onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="male">ប្រុស (Male)</option>
                <option value="female">ស្រី (Female)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="student-conduct"
                className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Conduct (សីលធម៌)
              </label>
              <select
                id="student-conduct"
                value={formData.conduct}
                onChange={(e) => setFormData((prev) => ({ ...prev, conduct: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="excellent">ល្អប្រសើរ (Excellent)</option>
                <option value="good">ល្អ (Good)</option>
                <option value="medium">មធ្យម (Fair)</option>
                <option value="poor">កែលម្អ (Needs Improvement)</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="student-date-of-birth"
              className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Date of Birth (ថ្ងៃខែឆ្នាំកំណើត)
            </label>
            <input
              id="student-date-of-birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={resetForm} disabled={isSaving}>
              Cancel / បោះបង់
            </Button>
            <Button type="submit" loading={isSaving}>
              Save Student / រក្សាទុក
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(deletingStudent)}
        onClose={() => !isDeleting && setDeletingStudent(null)}
        title="Remove Student / លុបសិស្ស"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to remove{' '}
            <span className="font-bold text-slate-900 dark:text-white">
              {deletingStudent?.nameKhmer || deletingStudent?.name}
            </span>
            ? This action cannot be undone.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeletingStudent(null)}
              disabled={isDeleting}
            >
              Cancel / បោះបង់
            </Button>
            <Button variant="danger" onClick={handleDeleteStudent} loading={isDeleting}>
              Remove / លុបចេញ
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
