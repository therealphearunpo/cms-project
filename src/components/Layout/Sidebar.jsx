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
import { NavLink } from 'react-router-dom';

import { ACCOUNT_ROLES, normalizeRole } from '../../constants/roles';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { path: '/dashboard', icon: HiOutlineHome, label: 'Dashboard', roles: [ACCOUNT_ROLES.STUDENT, ACCOUNT_ROLES.TEACHER, ACCOUNT_ROLES.ADMIN] },
  { path: '/attendance', icon: HiOutlineClipboardCheck, label: 'Attendance', roles: [ACCOUNT_ROLES.TEACHER, ACCOUNT_ROLES.ADMIN] },
  { path: '/students', icon: HiOutlineUserGroup, label: 'Students', roles: [ACCOUNT_ROLES.ADMIN] },
  { path: '/student-lookup', icon: HiOutlineSearch, label: 'User Lookup', roles: [ACCOUNT_ROLES.ADMIN] },
  { path: '/schedule', icon: HiOutlineCalendar, label: 'Class Schedule', roles: [ACCOUNT_ROLES.STUDENT, ACCOUNT_ROLES.TEACHER, ACCOUNT_ROLES.ADMIN] },
  { path: '/marksheets', icon: HiOutlineDocumentText, label: 'Marksheets', roles: [ACCOUNT_ROLES.STUDENT, ACCOUNT_ROLES.ADMIN] },
  { path: '/assignments', icon: HiOutlineBookOpen, label: 'Assignments', roles: [ACCOUNT_ROLES.STUDENT, ACCOUNT_ROLES.TEACHER] },
  { path: '/exams', icon: HiOutlineAcademicCap, label: 'Exam Schedule', roles: [ACCOUNT_ROLES.STUDENT, ACCOUNT_ROLES.TEACHER, ACCOUNT_ROLES.ADMIN] },
  { path: '/reports', icon: HiOutlineChartBar, label: 'Reports', roles: [ACCOUNT_ROLES.ADMIN] },
  { path: '/profile', icon: HiOutlineUser, label: 'My Profile', roles: [ACCOUNT_ROLES.STUDENT, ACCOUNT_ROLES.TEACHER, ACCOUNT_ROLES.ADMIN] },
];

export default function Sidebar({ isOpen, onClose, onMenuVisibilityToggle }) {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onClose();
          }}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-sidebar-bg z-50
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 shadow-sidebar
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10 flex-shrink-0">
          {/* Logo mark */}
          <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-extrabold text-xs tracking-wide">EDU</span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-white font-bold text-sm leading-tight tracking-wide truncate">MOEYS Portal</p>
            <p className="text-blue-200/60 text-[10px] uppercase tracking-[0.2em] mt-0.5">School Admin</p>
          </div>

          {/* Collapse sidebar button (mobile) */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors lg:hidden flex-shrink-0"
            aria-label="Close sidebar"
          >
            <HiOutlineX className="w-4 h-4 text-blue-100" />
          </button>

          {/* Hide sidebar button (desktop) */}
          <button
            type="button"
            onClick={onMenuVisibilityToggle}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors hidden lg:flex flex-shrink-0"
            aria-label="Hide sidebar"
          >
            <HiOutlineX className="w-4 h-4 text-blue-100" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {visibleMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom info card */}
        <div className="px-3 pb-4 flex-shrink-0">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--moeys-gold)]">
              Education Mission
            </p>
            <p className="mt-2 text-xs leading-5 text-blue-100/80">
              Formal ministry-style portal for school administration and academic monitoring.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
