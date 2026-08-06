import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  HiOutlineBell,
  HiOutlineLogout,
  HiOutlineMoon,
  HiOutlineSearch,
  HiOutlineSun,
  HiOutlineX,
  HiOutlineShieldCheck,
  HiOutlineAcademicCap,
  HiOutlineUserGroup,
  HiOutlineSparkles,
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

import { ACCOUNT_ROLES, getRoleLabel, normalizeRole } from '../../constants/roles';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { classOptions } from '../../data/students';
import { studentsAPI } from '../../services/api';
import Avatar from '../common/Avatar';

const LOCAL_STUDENTS_KEY = 'students_local_v2';

const pageEntries = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    subtitle: 'Overview & metrics',
    path: '/dashboard',
    roles: [ACCOUNT_ROLES.STUDENT, ACCOUNT_ROLES.TEACHER, ACCOUNT_ROLES.ADMIN],
  },
  {
    id: 'attendance',
    title: 'Attendance',
    subtitle: 'Daily attendance tracker',
    path: '/attendance',
    roles: [ACCOUNT_ROLES.TEACHER, ACCOUNT_ROLES.ADMIN],
  },
  {
    id: 'students',
    title: 'Students',
    subtitle: 'Student roster directory',
    path: '/students',
    roles: [ACCOUNT_ROLES.ADMIN],
  },
  {
    id: 'student-lookup',
    title: 'User Lookup',
    subtitle: 'Search student & staff accounts',
    path: '/student-lookup',
    roles: [ACCOUNT_ROLES.ADMIN],
  },
  {
    id: 'schedule',
    title: 'Class Schedule',
    subtitle: 'Weekly timetable',
    path: '/schedule',
    roles: [ACCOUNT_ROLES.STUDENT, ACCOUNT_ROLES.TEACHER, ACCOUNT_ROLES.ADMIN],
  },
  {
    id: 'marksheets',
    title: 'Marksheets',
    subtitle: 'Grades & academic performance',
    path: '/marksheets',
    roles: [ACCOUNT_ROLES.STUDENT, ACCOUNT_ROLES.ADMIN],
  },
  {
    id: 'assignments',
    title: 'Assignments',
    subtitle: 'Homework & practical tasks',
    path: '/assignments',
    roles: [ACCOUNT_ROLES.STUDENT, ACCOUNT_ROLES.TEACHER],
  },
  {
    id: 'exams',
    title: 'Exam Schedule',
    subtitle: 'Published exam timetable',
    path: '/exams',
    roles: [ACCOUNT_ROLES.STUDENT, ACCOUNT_ROLES.TEACHER, ACCOUNT_ROLES.ADMIN],
  },
  {
    id: 'reports',
    title: 'Reports',
    subtitle: 'School analytics & exports',
    path: '/reports',
    roles: [ACCOUNT_ROLES.ADMIN],
  },
  {
    id: 'profile',
    title: 'My Profile',
    subtitle: 'Account preferences & details',
    path: '/profile',
    roles: [ACCOUNT_ROLES.STUDENT, ACCOUNT_ROLES.TEACHER, ACCOUNT_ROLES.ADMIN],
  },
];

function readLocalStudents() {
  try {
    const raw = localStorage.getItem(LOCAL_STUDENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mergeUniqueStudents(items) {
  const map = new Map();
  items.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;
    const key =
      (item.id != null && `id:${String(item.id)}`) ||
      (item.studentId && `studentId:${String(item.studentId)}`) ||
      (item.email && `email:${String(item.email).toLowerCase()}`) ||
      `fallback:${String(item.name || '').toLowerCase()}-${String(item.class || '')}-${index}`;
    map.set(key, item);
  });
  return Array.from(map.values());
}

function MenuToggleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-slate-600 dark:text-slate-300"
      aria-hidden="true"
    >
      <rect x="3" y="6" width="18" height="2" rx="1" fill="currentColor" />
      <rect x="3" y="11" width="18" height="2" rx="1" fill="currentColor" />
      <rect x="3" y="16" width="18" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

export default function Header({ onMenuToggle, isMenuEnabled, onMenuVisibilityToggle }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const role = normalizeRole(user?.role);

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [focusIndex, setFocusIndex] = useState(-1);
  const [studentRecords, setStudentRecords] = useState([]);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (role !== ACCOUNT_ROLES.ADMIN) return undefined;
    let isActive = true;

    const loadStudents = async () => {
      const localStudents = readLocalStudents();
      try {
        const response = await studentsAPI.getAll();
        const apiStudents = Array.isArray(response?.data) ? response.data : [];
        if (isActive) {
          setStudentRecords(mergeUniqueStudents([...localStudents, ...apiStudents]));
        }
      } catch {
        if (isActive) {
          setStudentRecords(mergeUniqueStudents(localStudents));
        }
      }
    };

    loadStudents();
    return () => {
      isActive = false;
    };
  }, [role]);

  const searchEntries = useMemo(() => {
    const canSearchStudentRecords = role === ACCOUNT_ROLES.ADMIN;
    const seen = new Set();

    const studentEntries = (canSearchStudentRecords ? studentRecords : [])
      .filter((student) => {
        const key = `${student.name}-${student.class}-${student.rollNo}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 900)
      .map((student, idx) => ({
        id: `student-${idx}-${student.name}`,
        title: student.name,
        subtitle: `Class ${student.class} | Roll ${student.rollNo || '-'}`,
        path: '/students',
      }));

    const classEntries = (canSearchStudentRecords ? classOptions : [])
      .filter((option) => option.value)
      .map((option) => ({
        id: `class-${option.value}`,
        title: `Class ${option.value}`,
        subtitle: 'Student roster list',
        path: '/students',
      }));

    const visiblePages = pageEntries.filter((entry) => entry.roles.includes(role));
    return [...visiblePages, ...classEntries, ...studentEntries];
  }, [role, studentRecords]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return searchEntries
      .filter((entry) => `${entry.title} ${entry.subtitle}`.toLowerCase().includes(term))
      .slice(0, 8);
  }, [query, searchEntries]);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (!searchRef.current?.contains(event.target)) {
        setSearchOpen(false);
        setFocusIndex(-1);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  const executeSearchResult = (entry) => {
    setSearchOpen(false);
    setQuery('');
    setFocusIndex(-1);
    if (!entry) return;
    navigate(entry.path);
  };

  const onSearchKeyDown = (event) => {
    if (!results.length) {
      if (event.key === 'Enter') {
        event.preventDefault();
        navigate(role === ACCOUNT_ROLES.ADMIN ? '/students' : '/dashboard');
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setFocusIndex((prev) => (prev + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setFocusIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const target = focusIndex >= 0 ? results[focusIndex] : results[0];
      executeSearchResult(target);
    } else if (event.key === 'Escape') {
      setSearchOpen(false);
      setFocusIndex(-1);
    }
  };

  const profileName = user?.name || user?.email?.split('@')[0] || 'User';
  const profileRole = getRoleLabel(role);

  const getRoleBadgeStyle = (r) => {
    switch (r) {
      case ACCOUNT_ROLES.ADMIN:
        return {
          bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-400/10 dark:text-amber-400',
          icon: HiOutlineShieldCheck,
        };
      case ACCOUNT_ROLES.TEACHER:
        return {
          bg: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-400/10 dark:text-blue-400',
          icon: HiOutlineUserGroup,
        };
      default:
        return {
          bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-400',
          icon: HiOutlineAcademicCap,
        };
    }
  };

  const badgeStyle = getRoleBadgeStyle(role);
  const BadgeIcon = badgeStyle.icon;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 header-surface h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left Area: Brand & Navigation */}
      <div className="flex items-center gap-3 min-w-0">
        {!isMenuEnabled && (
          <button
            type="button"
            onClick={onMenuVisibilityToggle}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Turn on menu"
          >
            <MenuToggleIcon />
          </button>
        )}

        {isMenuEnabled && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors lg:hidden"
            aria-label="Toggle menu"
          >
            <MenuToggleIcon />
          </button>
        )}

        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xs tracking-wider shadow-md shadow-blue-600/20 flex-shrink-0">
            EDU
          </div>
          <div className="min-w-0 hidden sm:block">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold text-slate-900 dark:text-white truncate leading-tight tracking-tight">
                High School Management Portal
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Kingdom of Cambodia • Ministry of Education (MOEYS)
            </p>
          </div>
        </div>
      </div>

      {/* Middle Area: Command Palette Search Bar */}
      <div ref={searchRef} className="relative flex-1 max-w-md mx-2">
        <div className="search-shell flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm">
          <HiOutlineSearch className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Quick search (Press ⌘K to focus)..."
            className="w-full border-none bg-transparent text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400 text-xs sm:text-sm font-medium"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchOpen(true);
              setFocusIndex(-1);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={onSearchKeyDown}
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setFocusIndex(-1);
              }}
              className="rounded-full p-1 hover:bg-slate-200 dark:hover:bg-slate-700"
              aria-label="Clear search"
            >
              <HiOutlineX className="h-3.5 w-3.5 text-slate-500" />
            </button>
          ) : (
            <span className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-mono text-slate-400 bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-300/60 dark:border-slate-700 font-semibold">
              <HiOutlineSparkles className="w-3 h-3 text-blue-500" /> ⌘K
            </span>
          )}
        </div>

        {searchOpen && query.trim() && (
          <div className="search-dropdown absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl">
            {results.length ? (
              <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {results.map((result, index) => (
                  <li key={result.id}>
                    <button
                      type="button"
                      onClick={() => executeSearchResult(result)}
                      className={`w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                        index === focusIndex ? 'bg-blue-50/70 dark:bg-blue-950/40' : ''
                      }`}
                    >
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {result.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {result.subtitle}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">
                No results matching &quot;{query}&quot;.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Area: Status Badge, Theme Toggle, Notifications, Profile & Logout */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Role Pill Badge */}
        <div
          className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${badgeStyle.bg}`}
        >
          <BadgeIcon className="w-3.5 h-3.5" />
          <span>{profileRole}</span>
        </div>

        {/* Theme Switcher Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          title={isDark ? 'Light Theme' : 'Dark Theme'}
        >
          {isDark ? (
            <HiOutlineSun className="h-5 w-5 text-amber-400" />
          ) : (
            <HiOutlineMoon className="h-5 w-5 text-slate-600" />
          )}
        </button>

        {/* Notifications Button */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          aria-label="Notifications"
        >
          <HiOutlineBell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

        {/* User Profile Trigger */}
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
        >
          <Avatar name={profileName} size="sm" src={user?.avatar} />
          <div className="hidden lg:block">
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight max-w-[120px] truncate">
              {profileName}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight max-w-[120px] truncate font-medium">
              {profileRole}
            </p>
          </div>
        </button>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          aria-label="Logout"
          title="Logout"
        >
          <HiOutlineLogout className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
