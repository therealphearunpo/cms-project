import React from 'react';

import { SUBJECT_LABELS, SUBJECTS, computeSubjectScore } from './marksheetUtils';
import Button from '../common/Button';
import Modal from '../common/Modal';

export default function EditMarksheetModal({
  canEditMarks,
  editing,
  closeEditModal,
  handleSaveScores,
  formScores,
  setFormScores,
  isSaving,
}) {
  const updateScore = (subject, field, value) => {
    setFormScores((prev) => ({
      ...prev,
      [subject]: {
        ...(prev[subject] || { monthly: 0, exam: 0 }),
        [field]: value,
      },
    }));
  };

  return (
    <Modal
      isOpen={Boolean(editing) && canEditMarks}
      onClose={closeEditModal}
      title="កែប្រែពិន្ទុសិស្ស (Update Student Marksheet)"
    >
      {editing && (
        <form onSubmit={handleSaveScores} className="space-y-4">
          {/* Student info header */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {editing.nameKhmer || editing.name}
              {editing.nameLatin ? ` (${editing.nameLatin})` : ''}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              ថ្នាក់: {editing.class} | លេខ: {editing.rollNo || '-'}
              {editing.shift ? ` | ${editing.shift}` : ''}
            </p>
          </div>

          {/* Score entry table - Monthly + Exam per subject */}
          <div className="overflow-auto max-h-[55vh]">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <th className="text-left px-3 py-2 font-semibold rounded-tl-lg">
                    មុខវិជ្ជា (Subject)
                  </th>
                  <th className="text-center px-3 py-2 font-semibold w-28">
                    ពិន្ទុខែ (Monthly)
                  </th>
                  <th className="text-center px-3 py-2 font-semibold w-28">
                    ពិន្ទុប្រឡង (Exam)
                  </th>
                  <th className="text-center px-3 py-2 font-semibold w-20 rounded-tr-lg">
                    មធ្យម
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {SUBJECTS.map((subject) => {
                  const entry = formScores[subject] || { monthly: 0, exam: 0 };
                  const avg = computeSubjectScore(entry);
                  const isPassing = avg >= 50;
                  return (
                    <tr
                      key={subject}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">
                        {SUBJECT_LABELS[subject] || subject}
                      </td>
                      <td className="px-2 py-1">
                        <input
                          id={`score-${subject}-monthly`}
                          type="number"
                          min="0"
                          max="100"
                          value={entry.monthly ?? ''}
                          onChange={(e) => updateScore(subject, 'monthly', e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          id={`score-${subject}-exam`}
                          type="number"
                          min="0"
                          max="100"
                          value={entry.exam ?? ''}
                          onChange={(e) => updateScore(subject, 'exam', e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`font-bold font-mono ${isPassing ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
                        >
                          {avg}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            * មធ្យម = (ពិន្ទុខែ + ពិន្ទុប្រឡង) ÷ ២ — ស្តង់ដារ MoEYS
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={closeEditModal} disabled={isSaving}>
              បោះបង់
            </Button>
            <Button type="submit" loading={isSaving}>
              រក្សាទុក
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
