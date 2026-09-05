import React from 'react';

import { SUBJECT_LABELS, SUBJECTS } from './marksheetUtils';
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
  return (
    <Modal
      isOpen={Boolean(editing) && canEditMarks}
      onClose={closeEditModal}
      title="Update Student Marksheet / កែប្រែពិន្ទុសិស្ស"
    >
      {editing && (
        <form onSubmit={handleSaveScores} className="space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {editing.nameKhmer || editing.name}
              {editing.nameLatin ? ` (${editing.nameLatin})` : ''}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              Class: {editing.class} | Roll: {editing.rollNo || '-'}
              {editing.shift ? ` | ${editing.shift}` : ''}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {SUBJECTS.map((subject) => (
              <div key={subject}>
                <label
                  htmlFor={`score-${subject}`}
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  {SUBJECT_LABELS[subject] || subject}
                </label>
                <input
                  id={`score-${subject}`}
                  type="number"
                  min="0"
                  max="100"
                  value={formScores[subject] ?? ''}
                  onChange={(e) =>
                    setFormScores((prev) => ({ ...prev, [subject]: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={closeEditModal} disabled={isSaving}>
              Cancel / បោះបង់
            </Button>
            <Button type="submit" loading={isSaving}>
              Save Scores / រក្សាទុក
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
