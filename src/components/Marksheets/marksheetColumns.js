import React from 'react';

import { getGradeBadgeColor, SUBJECT_LABELS } from './marksheetUtils';
import Button from '../common/Button';

export default function createMarksheetColumns({ canEditMarks, subjects, openEditModal }) {
  return [
    {
      header: 'Rank / ចំណាត់ថ្នាក់',
      accessor: 'rank',
      sortable: true,
      render: (value) => {
        if (!value || value === '-') return <span className="text-xs text-slate-400">-</span>;
        const rankNum = Number(value);
        const isTop3 = rankNum <= 3;
        const top3Colors = {
          1: 'bg-amber-500 text-white font-bold',
          2: 'bg-slate-400 text-white font-bold',
          3: 'bg-amber-700 text-white font-bold',
        };
        return (
          <span
            className={`inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded-full text-xs ${
              isTop3
                ? top3Colors[rankNum]
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold'
            }`}
          >
            {isTop3 ? `№ ${rankNum}` : rankNum}
          </span>
        );
      },
    },
    {
      header: 'Student / ឈ្មោះសិស្ស',
      accessor: 'name',
      sortable: true,
      render: (_value, row) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white text-xs leading-tight">
            {row.nameKhmer || row.name}
          </div>
          {row.nameLatin && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {row.nameLatin}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Class',
      accessor: 'class',
      sortable: true,
      render: (value) => <span className="font-mono text-xs">{value}</span>,
    },
    ...subjects.map((subject) => ({
      header: SUBJECT_LABELS[subject] || subject.toUpperCase(),
      accessor: subject,
      sortable: true,
      render: (val) => {
        if (val === '' || val == null) return <span className="text-slate-400 text-xs">-</span>;
        const num = Number(val);
        return (
          <span
            className={`font-mono text-xs font-semibold ${
              num >= 50 ? 'text-slate-800 dark:text-slate-200' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {num}
          </span>
        );
      },
    })),
    {
      header: 'Total / សរុប',
      accessor: 'total',
      sortable: true,
      render: (val) =>
        val != null ? (
          <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
            {val}
          </span>
        ) : (
          <span className="text-slate-400 text-xs">-</span>
        ),
    },
    {
      header: 'Average / មធ្យមភាគ',
      accessor: 'avg',
      sortable: true,
      render: (val) =>
        val != null ? (
          <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
            {val}
          </span>
        ) : (
          <span className="text-slate-400 text-xs">-</span>
        ),
    },
    {
      header: 'MoEYS Grade / និទ្ទេស',
      accessor: 'grade',
      sortable: true,
      render: (value) => {
        if (!value || value === '-') {
          return <span className="text-xs text-slate-400">-</span>;
        }
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${getGradeBadgeColor(
              value
            )}`}
          >
            និទ្ទេស {value}
          </span>
        );
      },
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (_value, row) =>
        canEditMarks ? (
          <Button size="sm" variant="secondary" onClick={() => openEditModal(row)}>
            Edit / កែប្រែ
          </Button>
        ) : (
          <span className="text-xs text-slate-400">View only</span>
        ),
    },
  ];
}
