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
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onClose();
          }}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-50
          flex flex-col
          transform transition-transform duration-500 ease-in-out
          lg:translate-x-0 shadow-2xl shadow-slate-950/40
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-800 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 border border-blue-400/30 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/30">
            <span className="text-white font-extrabold text-xs tracking-wider">EDU</span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-slate-100 font-bold text-sm leading-tight tracking-wide truncate">
              MOEYS Portal
            </p>
            <p className="text-blue-400 text-[10px] font-semibold uppercase tracking-widest mt-0.5">
              School Management
            </p>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors lg:hidden flex-shrink-0"
            aria-label="Close sidebar"
          >
            <HiOutlineX className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
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
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Info Widget */}
        <div className="px-3 pb-4 flex-shrink-0">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
              National Education System
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              High School Class Management Portal for staff, teachers, and students.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
