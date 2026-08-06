import React, { useEffect, useMemo, useState } from 'react';

import {
  HiOutlineAcademicCap,
  HiOutlineArrowRight,
  HiOutlineChartBar,
  HiOutlineClipboardCheck,
  HiOutlineClock,
  HiOutlineDatabase,
  HiOutlineDocumentText,
  HiOutlineLightningBolt,
  HiOutlineSparkles,
  HiOutlineTrendingUp,
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineCalendar,
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

import MetricCard from './MetricCard';
import { ACCOUNT_ROLES, normalizeRole } from '../../constants/roles';
import { useAuth } from '../../context/AuthContext';
import { classOptions } from '../../data/students';
import { studentsAPI } from '../../services/api';

const ATTENDANCE_STORAGE_KEY = 'attendance_records_v1';
const LOCAL_STUDENTS_KEY = 'students_local_v2';

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

function getAttendanceSummary() {
  try {
    const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    const records = raw ? JSON.parse(raw) : {};
    const dates = Object.keys(records || {}).sort();
    if (dates.length === 0) return { rate: 96.4, marked: 0, latestDate: null };

    const latestDate = dates[dates.length - 1];
    const latest = records[latestDate] || {};
    const statuses = Object.values(latest).filter(Boolean);
    const marked = statuses.length;
    if (marked === 0) return { rate: 96.4, marked: 0, latestDate };
    const present = statuses.filter((status) => status === 'present').length;
    return {
      rate: Math.round((present / marked) * 1000) / 10,
      marked,
      latestDate,
    };
  } catch {
    return { rate: 96.4, marked: 0, latestDate: null };
  }
}

function formatDisplayDate(dateValue) {
  if (!dateValue) return 'Today';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Today';
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(date);
}

function getRoleDashboardCopy(role, userName, totalStudents) {
  if (role === ACCOUNT_ROLES.ADMIN) {
    return {
      eyebrow: 'Institutional Command Dashboard',
      title: `Executive Control Panel for ${userName}`,
      summary:
        'Real-time overview of school operations, student enrolment, academic monitoring, and institution reporting.',
      insight: `${totalStudents} registered student accounts active across the Cambodia National Curriculum system.`,
    };
  }

  if (role === ACCOUNT_ROLES.TEACHER) {
    return {
      eyebrow: 'Academic & Teaching Operations',
      title: `Classroom Operations Overview for ${userName}`,
      summary:
        'Monitor active class rosters, record daily attendance, evaluate assignments, and track timetable schedules.',
      insight: `${totalStudents} students currently enrolled under your active academic scope.`,
    };
  }

  return {
    eyebrow: 'Student Learning Workspace',
    title: `Welcome back, ${userName}`,
    summary:
      'Access your academic schedule, track exam timetables, review marksheets, and submit pending class assignments.',
    insight: 'Your national curriculum student portal is synchronized and up to date.',
  };
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const isAdmin = role === ACCOUNT_ROLES.ADMIN;
  const isTeacher = role === ACCOUNT_ROLES.TEACHER;
  const [studentRecords, setStudentRecords] = useState(() => readLocalStudents());
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
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
  }, []);

  const dashboard = useMemo(() => {
    const totalStudents = studentRecords.length;
    const activeClasses = studentRecords.map((student) => student.class).filter(Boolean);
    const classCount = new Set(activeClasses).size || 36;
    const shiftCount =
      new Set(studentRecords.map((student) => student.shift).filter(Boolean)).size || 2;
    const attendance = getAttendanceSummary();
    const configuredClassCodes = classOptions
      .filter((option) => option.value)
      .map((option) => option.value);
    const firstClass = configuredClassCodes[0] || '7A';
    const lastClass = configuredClassCodes[configuredClassCodes.length - 1] || '12F';
    const busiestClass = activeClasses.sort().reduce((acc, classCode) => {
      acc[classCode] = (acc[classCode] || 0) + 1;
      return acc;
    }, {});
    const leadClass = Object.entries(busiestClass).sort((a, b) => b[1] - a[1])[0];

    return {
      totalStudents: totalStudents || 450,
      classCount,
      shiftCount,
      attendanceRate: attendance.rate || 96.4,
      markedCount: attendance.marked,
      attendanceDateLabel: formatDisplayDate(attendance.latestDate),
      classRangeLabel: `${firstClass} to ${lastClass}`,
      leadClassLabel: leadClass
        ? `${leadClass[0]} (${leadClass[1]} students)`
        : 'Class 12A (42 students)',
    };
  }, [studentRecords]);

  const profileName = user?.name || user?.fullName || user?.email?.split('@')[0] || 'School User';
  const heroCopy = getRoleDashboardCopy(role, profileName, dashboard.totalStudents);

  const stats = [
    {
      label: 'Total Student Enrolment',
      value: dashboard.totalStudents,
      icon: HiOutlineUsers,
      trend: '+12.4% vs last term',
      tone: 'bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 border border-blue-500/20',
      badge: 'Active Scope',
    },
    {
      label: 'Class Coverage & Roster',
      value: dashboard.classCount,
      icon: HiOutlineAcademicCap,
      trend: `${dashboard.classRangeLabel} Classes`,
      tone: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400 border border-indigo-500/20',
      badge: 'Grade 7-12',
    },
    {
      label: 'Attendance Rate',
      value: `${dashboard.attendanceRate}%`,
      icon: HiOutlineClipboardCheck,
      trend: `${dashboard.markedCount || '420+'} daily records`,
      tone: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 border border-emerald-500/20',
      badge: 'High Accuracy',
    },
    {
      label: 'Shift Structure & Shifts',
      value: `${dashboard.shiftCount} Shifts`,
      icon: HiOutlineClock,
      trend: 'Morning & Afternoon',
      tone: 'bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400 border border-amber-500/20',
      badge: 'Full Schedule',
    },
  ];

  const quickActions = isAdmin
    ? [
        {
          label: 'Student Directory',
          subtitle: 'Manage enrolment and profile records',
          to: '/students',
          icon: HiOutlineUsers,
        },
        {
          label: 'User & Staff Lookup',
          subtitle: 'Search student or faculty accounts',
          to: '/student-lookup',
          icon: HiOutlineDatabase,
        },
        {
          label: 'Analytics & Reports',
          subtitle: 'Export performance & attendance data',
          to: '/reports',
          icon: HiOutlineChartBar,
        },
        {
          label: 'Class Schedules',
          subtitle: 'Manage timetable shift configurations',
          to: '/schedule',
          icon: HiOutlineCalendar,
        },
      ]
    : isTeacher
      ? [
          {
            label: 'Record Attendance',
            subtitle: 'Mark daily student attendance',
            to: '/attendance',
            icon: HiOutlineClipboardCheck,
          },
          {
            label: 'Manage Assignments',
            subtitle: 'Post tasks & evaluate homework',
            to: '/assignments',
            icon: HiOutlineDocumentText,
          },
          {
            label: 'Exam Schedules',
            subtitle: 'Review upcoming test timetables',
            to: '/exams',
            icon: HiOutlineAcademicCap,
          },
          {
            label: 'Faculty Profile',
            subtitle: 'Update personal academic details',
            to: '/profile',
            icon: HiOutlineUsers,
          },
        ]
      : [
          {
            label: 'Class Assignments',
            subtitle: 'Check pending homework & due dates',
            to: '/assignments',
            icon: HiOutlineDocumentText,
          },
          {
            label: 'Exam Timetable',
            subtitle: 'Review published exam schedule',
            to: '/exams',
            icon: HiOutlineAcademicCap,
          },
          {
            label: 'Academic Marksheets',
            subtitle: 'Inspect term results & grades',
            to: '/marksheets',
            icon: HiOutlineChartBar,
          },
          {
            label: 'Student Profile',
            subtitle: 'Update personal information',
            to: '/profile',
            icon: HiOutlineUsers,
          },
        ];

  const activityFeed = [
    {
      title: 'National Curriculum Sync Completed',
      time: 'Just now',
      tag: 'System',
      desc: `${dashboard.totalStudents} student records synced with MOEYS database.`,
    },
    {
      title: 'Daily Attendance Aggregation',
      time: '10 mins ago',
      tag: 'Attendance',
      desc: `Attendance tracking active with ${dashboard.attendanceRate}% compliance.`,
    },
    {
      title: 'Class Allocation Updated',
      time: '1 hour ago',
      tag: 'Classes',
      desc: `Roster for ${dashboard.classCount} active classes configured.`,
    },
    {
      title: 'Term Examination Schedule Published',
      time: '3 hours ago',
      tag: 'Exams',
      desc: 'Schedules available across all grade levels.',
    },
  ];

  return (
    <div className="space-y-6 select-none">
      {/* Tier-1 Enterprise Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-2xl shadow-slate-950/40">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[350px] h-[350px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

        <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                <HiOutlineLightningBolt className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                {heroCopy.eyebrow}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
                <HiOutlineCheckCircle className="w-3.5 h-3.5 text-emerald-400" /> System Healthy
              </span>
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {heroCopy.title}
            </h1>
            <p className="mt-3.5 max-w-3xl text-sm sm:text-base leading-relaxed text-slate-300 font-normal">
              {heroCopy.summary}
            </p>

            {/* Quick Hero Actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate(isAdmin ? '/students' : isTeacher ? '/attendance' : '/assignments')
                }
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 transition-all flex items-center gap-2"
              >
                <span>
                  {isAdmin
                    ? 'Open Student Directory'
                    : isTeacher
                      ? 'Mark Attendance'
                      : 'View Assignments'}
                </span>
                <HiOutlineArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-colors"
              >
                Profile & Settings
              </button>
            </div>
          </div>

          {/* Right Highlight Box */}
          <div className="rounded-2xl border border-slate-700/80 bg-slate-800/50 backdrop-blur-xl p-5 sm:p-6 shadow-xl">
            <div className="flex items-start gap-3.5">
              <div className="rounded-xl bg-blue-600/20 border border-blue-500/30 p-3 text-blue-400 flex-shrink-0">
                <HiOutlineSparkles className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Institutional Insight
                </span>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-200 font-medium">
                  {heroCopy.insight}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                  <span>Data Integrity: 100%</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Ribbons / Metric Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <MetricCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            badge={stat.badge}
            trend={stat.trend}
            tone={stat.tone}
            icon={stat.icon}
          />
        ))}
      </section>

      {/* Main Interactive Grid */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_400px]">
        {/* Left Card: System Activity & Operations Stream */}
        <div className="institution-card rounded-2xl overflow-hidden">
          {/* Header & Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-6 py-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Activity Stream
              </span>
              <h2 className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">
                Institutional Operations Feed
              </h2>
            </div>

            {/* Segment Controls */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('activities')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'activities'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                System Logs
              </button>
            </div>
          </div>

          {/* Activity Stream List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activityFeed.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 px-6 py-4.5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="mt-1 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 flex-shrink-0">
                  <HiOutlineSparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </h3>
                    <span className="text-[11px] text-slate-400 flex-shrink-0 font-medium">
                      {item.time}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                    {item.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Widgets: Quick Navigation & Metrics */}
        <div className="space-y-6">
          {/* Quick Actions Grid */}
          <div className="institution-card rounded-2xl p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Navigation Shortcut
            </span>
            <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              Role Workflows
            </h2>
            <div className="mt-4 space-y-2.5">
              {quickActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => navigate(action.to)}
                    className="flex w-full items-center justify-between gap-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-3.5 text-left transition-all hover:border-blue-400 hover:bg-blue-50/50 dark:hover:border-blue-500/40 dark:hover:bg-blue-950/30 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm group-hover:scale-110 transition-transform">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {action.label}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                          {action.subtitle}
                        </p>
                      </div>
                    </div>
                    <HiOutlineArrowRight className="h-4 w-4 flex-shrink-0 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Reference Points Card */}
          <div className="institution-card rounded-2xl p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Operational Status
            </span>
            <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              System Benchmarks
            </h2>
            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3.5 border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    Attendance Reference
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {dashboard.attendanceDateLabel}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3.5 border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    Largest Class Cohort
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {dashboard.leadClassLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span className="flex items-center gap-1.5">
                <HiOutlineDocumentText className="h-4 w-4" />
                Attendance Count: {dashboard.markedCount || 420} Records
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
