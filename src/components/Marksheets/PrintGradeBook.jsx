import React, { useEffect, useRef } from 'react';

import {
  computeSubjectScore,
  getGradeFromAverage,
  GRADE_KHMER_LABELS,
  SUBJECT_LABELS,
  SUBJECT_LABELS_EN,
  SUBJECTS,
} from './marksheetUtils';
import { SEMESTER_LABELS, KHMER_MONTHS } from '../../data/academicCalendar';
import { CONDUCT_LABELS } from '../../data/students';

/**
 * PrintGradeBook — renders a print-ready MoEYS-style grade book (បញ្ជីពិន្ទុ).
 * Trigger window.print() to print.
 */
export default function PrintGradeBook({
  rows,
  selectedClass,
  semester,
  academicYear,
  schoolName = 'វិទ្យាល័យ...',
  schoolCode = '',
  isOpen,
  onClose,
}) {
  const printRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const printNow = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;

    const printWindow = window.open('', '_blank', 'width=1100,height=800');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="km">
      <head>
        <meta charset="UTF-8" />
        <title>បញ្ជីពិន្ទុ — ${selectedClass || ''} — ${SEMESTER_LABELS[semester] || semester} — ${academicYear}</title>
        <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;600;700&display=swap" rel="stylesheet" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Kantumruy Pro', sans-serif;
            font-size: 11px;
            color: #111;
            background: #fff;
            padding: 12mm 15mm;
          }
          .header { text-align: center; margin-bottom: 8px; }
          .header h1 { font-size: 15px; font-weight: 700; margin-bottom: 2px; }
          .header h2 { font-size: 13px; font-weight: 600; margin-bottom: 2px; }
          .header p { font-size: 11px; color: #444; }
          .meta-row { display: flex; justify-content: space-between; margin: 6px 0; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10px; }
          th, td { border: 1px solid #999; padding: 3px 5px; text-align: center; }
          th { background: #f0f4ff; font-weight: 700; }
          .col-name { text-align: left; min-width: 100px; }
          .col-rank { min-width: 36px; }
          .pass { color: #15803d; font-weight: 700; }
          .fail { color: #b91c1c; font-weight: 700; }
          .grade-badge { display: inline-block; font-weight: 700; padding: 0 4px; }
          .footer { margin-top: 16px; display: flex; justify-content: space-between; font-size: 11px; }
          .footer .sig { width: 200px; text-align: center; }
          .footer .sig .line { border-top: 1px solid #333; margin: 30px auto 4px; width: 80%; }
          @media print {
            body { padding: 10mm 12mm; }
            button { display: none !important; }
          }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  if (!isOpen) return null;

  const today = new Date();
  const todayStr = `${today.getDate()} ${KHMER_MONTHS[today.getMonth()]} ${today.getFullYear()}`;
  const semesterLabel = SEMESTER_LABELS[semester] || semester;
  const scoredRows = rows.filter((r) => r.hasScores);

  // Build subject final averages
  const getSubjectAvg = (row, subject) => {
    const raw = row[subject];
    if (raw == null || raw === '') return null;
    if (typeof raw === 'object') return computeSubjectScore(raw);
    return Number(raw);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 overflow-auto p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              បញ្ជីពិន្ទុ — Preview
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedClass || 'All Classes'} · {semesterLabel} · {academicYear}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={printNow}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              🖨️ បោះពុម្ព (Print)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              ✕ បិទ
            </button>
          </div>
        </div>

        {/* Print content */}
        <div className="overflow-auto flex-1 p-6 bg-gray-100 dark:bg-slate-950">
          <div
            ref={printRef}
            className="bg-white mx-auto shadow-lg"
            style={{ maxWidth: '1020px', padding: '24px 28px', fontFamily: "'Kantumruy Pro', sans-serif", fontSize: '11px', color: '#111' }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <p style={{ fontSize: '11px', color: '#444' }}>
                ព្រះរាជាណាចក្រកម្ពុជា • ជាតិ សាសនា ព្រះមហាក្សត្រ
              </p>
              <p style={{ fontSize: '11px', marginTop: '2px', fontWeight: 600 }}>
                ក្រសួងអប់រំ យុវជន និងកីឡា (MoEYS)
              </p>
              <h1 style={{ fontSize: '16px', fontWeight: 700, marginTop: '8px' }}>
                {schoolName}
                {schoolCode ? ` — លេខកូដ: ${schoolCode}` : ''}
              </h1>
              <h2 style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>
                បញ្ជីពិន្ទុ (Grade Book)
              </h2>
            </div>

            {/* Meta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '8px', borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', padding: '6px 0' }}>
              <span>ថ្នាក់: <strong>{selectedClass || 'គ្រប់ថ្នាក់'}</strong></span>
              <span>វគ្គ: <strong>{semesterLabel}</strong></span>
              <span>ឆ្នាំសិក្សា: <strong>{academicYear}</strong></span>
              <span>ចំនួនសិស្ស: <strong>{scoredRows.length}</strong></span>
              <span>កាលបរិច្ឆេទ: <strong>{todayStr}</strong></span>
            </div>

            {/* Grade table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                <thead>
                  <tr style={{ background: '#e8eef8' }}>
                    <th style={{ border: '1px solid #aaa', padding: '4px 6px', textAlign: 'center', minWidth: '32px' }}>
                      ល.រ
                    </th>
                    <th style={{ border: '1px solid #aaa', padding: '4px 6px', textAlign: 'left', minWidth: '100px' }}>
                      ឈ្មោះ
                    </th>
                    {SUBJECTS.map((subj) => (
                      <th key={subj} style={{ border: '1px solid #aaa', padding: '4px 3px', minWidth: '40px' }}>
                        <div style={{ fontWeight: 700 }}>{SUBJECT_LABELS[subj]}</div>
                        <div style={{ fontSize: '9px', fontWeight: 400, color: '#666' }}>{SUBJECT_LABELS_EN[subj]}</div>
                      </th>
                    ))}
                    <th style={{ border: '1px solid #aaa', padding: '4px 5px', background: '#dce6f8', minWidth: '44px' }}>
                      មធ្យម<br /><span style={{ fontSize: '9px' }}>Average</span>
                    </th>
                    <th style={{ border: '1px solid #aaa', padding: '4px 5px', background: '#dce6f8', minWidth: '44px' }}>
                      និទ្ទេស<br /><span style={{ fontSize: '9px' }}>Grade</span>
                    </th>
                    <th style={{ border: '1px solid #aaa', padding: '4px 5px', background: '#dce6f8', minWidth: '36px' }}>
                      ចំណាត់<br /><span style={{ fontSize: '9px' }}>Rank</span>
                    </th>
                    <th style={{ border: '1px solid #aaa', padding: '4px 5px', minWidth: '60px' }}>
                      ព្រឹត្តិបត្រ<br /><span style={{ fontSize: '9px' }}>Conduct</span>
                    </th>
                    <th style={{ border: '1px solid #aaa', padding: '4px 5px', minWidth: '50px' }}>
                      លទ្ធផល<br /><span style={{ fontSize: '9px' }}>Result</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scoredRows.map((row, idx) => {
                    const grade = getGradeFromAverage(row.avg);
                    const passed = (row.avg || 0) >= 50;
                    const conductLabel = CONDUCT_LABELS?.[row.conduct] || row.conduct || '-';
                    return (
                      <tr
                        key={row.studentId}
                        style={{ background: idx % 2 === 0 ? '#fff' : '#f8faff' }}
                      >
                        <td style={{ border: '1px solid #aaa', padding: '3px 5px', textAlign: 'center' }}>{idx + 1}</td>
                        <td style={{ border: '1px solid #aaa', padding: '3px 6px', textAlign: 'left' }}>
                          <div style={{ fontWeight: 600 }}>{row.nameKhmer || row.name}</div>
                          <div style={{ fontSize: '9px', color: '#666' }}>{row.nameLatin || row.name}</div>
                        </td>
                        {SUBJECTS.map((subj) => {
                          const avg = getSubjectAvg(row, subj);
                          return (
                            <td key={subj} style={{ border: '1px solid #aaa', padding: '3px 4px', textAlign: 'center', color: avg != null && avg < 50 ? '#b91c1c' : '#111', fontWeight: avg != null && avg < 50 ? 700 : 400 }}>
                              {avg != null ? avg : '-'}
                            </td>
                          );
                        })}
                        <td style={{ border: '1px solid #aaa', padding: '3px 5px', textAlign: 'center', fontWeight: 700, background: '#f0f4ff' }}>
                          {row.avg ?? '-'}
                        </td>
                        <td style={{ border: '1px solid #aaa', padding: '3px 5px', textAlign: 'center', fontWeight: 700, background: '#f0f4ff' }}>
                          {grade !== '-' ? (
                            <span>
                              {grade}
                              <br />
                              <span style={{ fontSize: '9px', fontWeight: 400, color: '#555' }}>
                                {GRADE_KHMER_LABELS[grade] || ''}
                              </span>
                            </span>
                          ) : '-'}
                        </td>
                        <td style={{ border: '1px solid #aaa', padding: '3px 5px', textAlign: 'center', fontWeight: 700, background: '#f0f4ff' }}>
                          {row.rank || '-'}
                        </td>
                        <td style={{ border: '1px solid #aaa', padding: '3px 5px', textAlign: 'center', fontSize: '10px' }}>
                          {conductLabel}
                        </td>
                        <td style={{ border: '1px solid #aaa', padding: '3px 5px', textAlign: 'center', fontWeight: 700, color: passed ? '#15803d' : '#b91c1c' }}>
                          {passed ? 'ជាប់' : 'ធ្លាក់'}
                        </td>
                      </tr>
                    );
                  })}
                  {scoredRows.length === 0 && (
                    <tr>
                      <td colSpan={SUBJECTS.length + 7} style={{ border: '1px solid #aaa', padding: '12px', textAlign: 'center', color: '#888' }}>
                        មិនមានទិន្នន័យ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary row */}
            <div style={{ marginTop: '10px', fontSize: '11px', display: 'flex', gap: '24px' }}>
              <span>
                ចំនួនសិស្សដែលជាប់:{' '}
                <strong style={{ color: '#15803d' }}>
                  {scoredRows.filter((r) => (r.avg || 0) >= 50).length}
                </strong>
              </span>
              <span>
                ចំនួនសិស្សដែលធ្លាក់:{' '}
                <strong style={{ color: '#b91c1c' }}>
                  {scoredRows.filter((r) => (r.avg || 0) < 50).length}
                </strong>
              </span>
              <span>
                អត្រាជោគជ័យ:{' '}
                <strong>
                  {scoredRows.length > 0
                    ? `${((scoredRows.filter((r) => (r.avg || 0) >= 50).length / scoredRows.length) * 100).toFixed(1)}%`
                    : '-'}
                </strong>
              </span>
            </div>

            {/* Signature section */}
            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <div style={{ textAlign: 'center', width: '180px' }}>
                <p>គ្រូប្រចាំថ្នាក់</p>
                <p style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>Class Teacher</p>
                <div style={{ borderTop: '1px solid #333', marginTop: '36px', paddingTop: '4px' }}>
                  ហត្ថលេខា / Signature
                </div>
              </div>
              <div style={{ textAlign: 'center', width: '180px' }}>
                <p>ប្រធានសាលា</p>
                <p style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>School Director</p>
                <div style={{ borderTop: '1px solid #333', marginTop: '36px', paddingTop: '4px' }}>
                  ហត្ថលេខា / Signature
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
