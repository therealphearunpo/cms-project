import React from 'react';

import {
  HiOutlineHome,
  HiOutlineClipboardCheck,
  HiOutlineUserGroup,
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineBookOpen,
  HiOutlineAcademicCap,
  HiOutlineChartBar,
  HiOutlineUser,
  HiOutlineSearch,
  HiOutlineX,
} from 'react-icons/hi';
import { NavLink, useLocation } from 'react-router-dom';

import { ACCOUNT_ROLES, normalizeRole } from '../../constants/roles';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  {
    path: '/dashboard',
    icon: HiOutlineHome,
    label: 'Dashboard',
    roles: [ACCOUNT_ROLES.STUDENT, ACCOUNT_ROLES.TEACHER, ACCOUNT_ROLES.ADMIN],
  },
  {
    path: '/attendance',
    icon: HiOutlineClipboardCheck,
    label: 'Attendance',
    roles: [ACCOUNT_ROLES.TEACHER, ACCOUNT_ROLES.ADMIN],
  },
  { path: '/students', icon: HiOutlineUserGroup, label: 'Students', roles: [ACCOUNT_ROLES.ADMIN] },
  {
    path: '/student-lookup',
    icon: HiOutlineSearch,
    label: 'User Lookup',
    roles: [ACCOUNT_ROLES.ADMIN],
  },
  {
    path: '/schedule',
    icon: HiOutlineCalendar,
    label: 'Class Schedule',
    roles: [ACCOUNT_ROLES.STUDENT, ACCOUNT_ROLES.TEACHER, ACCOUNT_ROLES.ADMIN],
  },
  {
    path: '/marksheets',
    icon: HiOutlineDocumentText,
    label: 'Marksheets',
    roles: [ACCOUNT_ROLES.STUDENT, ACCOUNT_ROLES.ADMIN],
  },
  {
    path: '/assignments',
    icon: HiOutlineBookOpen,
    label: 'Assignments',
    roles: [ACCOUNT_ROLES.STUDENT, ACCOUNT_ROLES.TEACHER],
  },
  {
    path: '/exams',
    icon: HiOutlineAcademicCap,
    label: 'Exam Schedule',
    roles: [ACCOUNT_ROLES.STUDENT, ACCOUNT_ROLES.TEACHER, ACCOUNT_ROLES.ADMIN],
  },
  { path: '/reports', icon: HiOutlineChartBar, label: 'Reports', roles: [ACCOUNT_ROLES.ADMIN] },
  {
    path: '/profile',
    icon: HiOutlineUser,
    label: 'My Profile',
    roles: [ACCOUNT_ROLES.STUDENT, ACCOUNT_ROLES.TEACHER, ACCOUNT_ROLES.ADMIN],
  },
];

export default function Sidebar({ isOpen, onClose, onMenuVisibilityToggle }) {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const location = useLocation();
  const visibleMenuItems = menuItems.filter(
    (item) => item.roles.includes(role) && (!item.adminCenterOnly || user?.isAdminCenterMember)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onClose();
          }}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-slate-950 border-r border-slate-800 z-50
          flex flex-col
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-slate-800 flex-shrink-0">
          <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">
            CMS
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-slate-100 font-semibold text-sm leading-tight truncate">
              School Management
            </p>
            <p className="text-slate-400 text-[11px] font-normal truncate">
              Class Portal
            </p>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:bg-slate-800 hover:text-white transition-colors lg:hidden flex-shrink-0"
            aria-label="Close sidebar"
          >
            <HiOutlineX className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {visibleMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (location.pathname === item.path) {
                  onClose();
                  onMenuVisibilityToggle();
                }
              }}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom System Info */}
        <div className="p-3 border-t border-slate-800 flex-shrink-0 text-xs text-slate-400 flex items-center justify-between">
          <span className="font-mono text-[11px]">v2.0.0</span>
          <span className="inline-flex items-center gap-1.5 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Operational
          </span>
        </div>
      </aside>
    </>
  );
}
