import React, { useMemo, useState } from 'react';

import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineDownload,
  HiOutlineFilter,
  HiOutlineSearch,
} from 'react-icons/hi';

import Button from './Button';
import { useLanguage } from '../../context/LanguageContext';
import { usePagination } from '../../hooks/usePagination';

function buildPageItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
    pages.add(totalPages - 3);
  }

  const sortedPages = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);

  const items = [];
  sortedPages.forEach((page, index) => {
    if (index > 0 && page - sortedPages[index - 1] > 1) {
      items.push(`ellipsis-${sortedPages[index - 1]}-${page}`);
    }
    items.push(page);
  });

  return items;
}

export default function DataTable({
  columns,
  data,
  onRowClick,
  loading = false,
  pagination = true,
  searchable = true,
  exportable = true,
  filterable = true,
  itemsPerPage = 10,
}) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const { currentItems, currentPage, totalPages, nextPage, prevPage, paginate } = usePagination(
    sortedData,
    itemsPerPage
  );
  const pageItems = useMemo(
    () => buildPageItems(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const requestSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const exportData = () => {
    const csv = [
      columns.map((col) => col.header).join(','),
      ...sortedData.map((row) =>
        columns.map((col) => JSON.stringify(row[col.accessor] || '')).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${Date.now()}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-card p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-card overflow-hidden">
      <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {searchable && (
          <div className="relative flex-1 max-w-md">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('common.search_records', 'Search records...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {filterable && (
            <Button variant="secondary" size="sm" icon={HiOutlineFilter}>
              {t('common.filter', 'Filter')}
            </Button>
          )}
          {exportable && (
            <Button variant="secondary" size="sm" icon={HiOutlineDownload} onClick={exportData}>
              {t('common.export_excel', 'Export')}
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              {columns.map((column) => (
                <th
                  key={column.accessor}
                  onClick={() => column.sortable && requestSort(column.accessor)}
                  className={`
                    px-4 py-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400
                    ${column.sortable ? 'cursor-pointer hover:text-slate-900 dark:hover:text-white' : ''}
                  `}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {sortConfig.key === column.accessor && (
                      <span className="text-slate-400 font-mono">
                        {sortConfig.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {currentItems.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-xs text-slate-500 dark:text-slate-400"
                >
                  {t('common.no_records', 'No records found')}
                </td>
              </tr>
            ) : (
              currentItems.map((row, index) => (
                <tr
                  key={index}
                  onClick={() => onRowClick?.(row)}
                  className={`
                    hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors
                    ${onRowClick ? 'cursor-pointer' : ''}
                  `}
                >
                  {columns.map((column) => (
                    <td
                      key={column.accessor}
                      className="px-4 py-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200"
                    >
                      {column.render
                        ? column.render(row[column.accessor], row)
                        : row[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="flex flex-col gap-3 border-t border-slate-200 dark:border-slate-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            {t('common.showing', 'Showing')}{' '}
            <span className="font-semibold text-slate-900 dark:text-white">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{' '}
            -{' '}
            <span className="font-semibold text-slate-900 dark:text-white">
              {Math.min(currentPage * itemsPerPage, sortedData.length)}
            </span>{' '}
            {t('common.of', 'of')}{' '}
            <span className="font-semibold text-slate-900 dark:text-white">
              {sortedData.length}
            </span>{' '}
            {t('common.entries', 'entries')}
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label={t('common.prev', 'Previous')}
            >
              <HiOutlineChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 font-mono text-xs">
              {pageItems.map((item) => {
                if (typeof item === 'string') {
                  return (
                    <span
                      key={item}
                      className="flex h-7 min-w-[1.5rem] items-center justify-center px-1 text-slate-400"
                    >
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={item}
                    onClick={() => paginate(item)}
                    className={`
                      h-7 min-w-[1.75rem] rounded-md px-1.5 font-medium transition-colors
                      ${
                        currentPage === item
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }
                    `}
                    aria-current={currentPage === item ? 'page' : undefined}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label={t('common.next', 'Next')}
            >
              <HiOutlineChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
