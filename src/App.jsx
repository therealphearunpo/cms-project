import React, { useEffect } from 'react';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AssignmentsPage from './components/Assignments/AssignmentsPage';
import AttendancePage from './components/Attendance/AttendancePage';
import AuthRoutes from './components/Auth/AuthRoutes';
import LoginPage from './components/Auth/LoginPage';
import DashboardPage from './components/Dashboard/DashboardPage';
import ExamsPage from './components/Exams/ExamsPage';
import Layout from './components/Layout/Layout';
import MarksheetsPage from './components/Marksheets/MarksheetsPage';
import ProfilePage from './components/Profile/ProfilePage';
import ReportsPage from './components/Reports/ReportsPage';
import SchedulePage from './components/Schedule/SchedulePage';
import StudentLookupPage from './components/Students/StudentLookupPage';
import StudentsPage from './components/Students/StudentsPage';
import { ACCOUNT_ROLES, getRoleHomePath, normalizeRole } from './constants/roles';
import { AttendanceProvider } from './context/AttendanceContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

const STUDENT_DATA_RESET_KEY = 'student_data_reset_v1';
const STUDENT_STORAGE_KEYS = ['students_local_v2', 'marksheets_local_v2', 'teachers_local_v1'];

const DEMO_CLASS12_STUDENTS = [
  {
    id: 'local-demo-12-1',
    studentId: 'CMS100001',
    name: 'Sok Pheak',
    class: '12A',
    shift: 'Morning',
    gender: 'male',
    email: 'sok.pheak.12a@school.edu',
    dateOfBirth: '2006-02-14',
    isLocalOnly: true,
    status: 'active',
  },
  {
    id: 'local-demo-12-2',
    studentId: 'CMS100002',
    name: 'Chann Ravy',
    class: '12A',
    shift: 'Morning',
    gender: 'female',
    email: 'chann.ravy.12a@school.edu',
    dateOfBirth: '2006-03-18',
    isLocalOnly: true,
    status: 'active',
  },
  {
    id: 'local-demo-12-3',
    studentId: 'CMS100003',
    name: 'Nguon Kimheng',
    class: '12A',
    shift: 'Morning',
    gender: 'male',
    email: 'nguon.kimheng.12a@school.edu',
    dateOfBirth: '2006-04-05',
    isLocalOnly: true,
    status: 'active',
  },
  {
    id: 'local-demo-12-4',
    studentId: 'CMS100004',
    name: 'Sieng Sreylin',
    class: '12A',
    shift: 'Morning',
    gender: 'female',
    email: 'sieng.sreylin.12a@school.edu',
    dateOfBirth: '2006-05-12',
    isLocalOnly: true,
    status: 'active',
  },
  {
    id: 'local-demo-12-5',
    studentId: 'CMS100005',
    name: 'Khun Leakhena',
    class: '12A',
    shift: 'Afternoon',
    gender: 'female',
    email: 'khun.leakhena.12a@school.edu',
    dateOfBirth: '2006-06-21',
    isLocalOnly: true,
    status: 'active',
  },
  {
    id: 'local-demo-12-6',
    studentId: 'CMS100006',
    name: 'Mey Visal',
    class: '12A',
    shift: 'Afternoon',
    gender: 'male',
    email: 'mey.visal.12a@school.edu',
    dateOfBirth: '2006-07-09',
    isLocalOnly: true,
    status: 'active',
  },
  {
    id: 'local-demo-12-7',
    studentId: 'CMS100007',
    name: 'Pov Dalin',
    class: '12A',
    shift: 'Morning',
    gender: 'female',
    email: 'pov.dalin.12a@school.edu',
    dateOfBirth: '2006-08-17',
    isLocalOnly: true,
    status: 'active',
  },
  {
    id: 'local-demo-12-8',
    studentId: 'CMS100008',
    name: 'Tep Narin',
    class: '12A',
    shift: 'Morning',
    gender: 'male',
    email: 'tep.narin.12a@school.edu',
    dateOfBirth: '2006-09-03',
    isLocalOnly: true,
    status: 'active',
  },
  {
    id: 'local-demo-12-9',
    studentId: 'CMS100009',
    name: 'Yim Seila',
    class: '12A',
    shift: 'Afternoon',
    gender: 'female',
    email: 'yim.seila.12a@school.edu',
    dateOfBirth: '2006-10-11',
    isLocalOnly: true,
    status: 'active',
  },
  {
    id: 'local-demo-12-10',
    studentId: 'CMS100010',
    name: 'Chan Dara',
    class: '12A',
    shift: 'Afternoon',
    gender: 'male',
    email: 'chan.dara.12a@school.edu',
    dateOfBirth: '2006-11-26',
    isLocalOnly: true,
    status: 'active',
  },
  {
    id: 'local-demo-12-11',
    studentId: 'CMS100011',
    name: 'Lim Sophy',
    class: '12A',
    shift: 'Morning',
    gender: 'female',
    email: 'lim.sophy.12a@school.edu',
    dateOfBirth: '2006-12-08',
    isLocalOnly: true,
    status: 'active',
  },
  {
    id: 'local-demo-12-12',
    studentId: 'CMS100012',
    name: 'Ros Samnang',
    class: '12A',
    shift: 'Afternoon',
    gender: 'male',
    email: 'ros.samnang.12a@school.edu',
    dateOfBirth: '2006-01-24',
    isLocalOnly: true,
    status: 'active',
  },
];

const DEMO_CLASS12_STAFF = [
  {
    id: 'staff-demo-1',
    employeeId: 'T0001',
    name: 'Seng Sreyphea',
    gender: 'female',
    class: 'Science',
    stream: 'Science',
    subject: 'Mathematics',
    shift: 'Staff',
    email: 'seng.sreyphea@school.edu',
    isActive: true,
  },
  {
    id: 'staff-demo-2',
    employeeId: 'T0002',
    name: 'Vong Chanthy',
    gender: 'female',
    class: 'Science',
    stream: 'Science',
    subject: 'Physics',
    shift: 'Staff',
    email: 'vong.chanthy@school.edu',
    isActive: true,
  },
  {
    id: 'staff-demo-3',
    employeeId: 'T0003',
    name: 'Keo Sokun',
    gender: 'male',
    class: 'Science',
    stream: 'Science',
    subject: 'Chemistry',
    shift: 'Staff',
    email: 'keo.sokun@school.edu',
    isActive: true,
  },
  {
    id: 'staff-demo-4',
    employeeId: 'T0004',
    name: 'Chea Borin',
    gender: 'male',
    class: 'Science',
    stream: 'Science',
    subject: 'Biology',
    shift: 'Staff',
    email: 'chea.borin@school.edu',
    isActive: true,
  },
  {
    id: 'staff-demo-5',
    employeeId: 'T0005',
    name: 'Nhem Pisey',
    gender: 'female',
    class: 'Social',
    stream: 'Social',
    subject: 'Khmer Language & Literature',
    shift: 'Staff',
    email: 'nhem.pisey@school.edu',
    isActive: true,
  },
  {
    id: 'staff-demo-6',
    employeeId: 'T0006',
    name: 'Khem Sothea',
    gender: 'female',
    class: 'Social',
    stream: 'Social',
    subject: 'English',
    shift: 'Staff',
    email: 'khem.sothea@school.edu',
    isActive: true,
  },
  {
    id: 'staff-demo-7',
    employeeId: 'T0007',
    name: 'Touch Vannak',
    gender: 'male',
    class: 'Social',
    stream: 'Social',
    subject: 'History',
    shift: 'Staff',
    email: 'touch.vannak@school.edu',
    isActive: true,
  },
  {
    id: 'staff-demo-8',
    employeeId: 'T0008',
    name: 'Heng Sokha',
    gender: 'male',
    class: 'Social',
    stream: 'Social',
    subject: 'Geography',
    shift: 'Staff',
    email: 'heng.sokha@school.edu',
    isActive: true,
  },
  {
    id: 'staff-demo-9',
    employeeId: 'T0009',
    name: 'Kun Maline',
    gender: 'female',
    class: 'Science',
    stream: 'Science',
    subject: 'Digital Literacy / ICT',
    shift: 'Staff',
    email: 'kun.maline@school.edu',
    isActive: true,
  },
  {
    id: 'staff-demo-10',
    employeeId: 'T0010',
    name: 'Ouk Chenda',
    gender: 'female',
    class: 'Social',
    stream: 'Social',
    subject: 'Physical Education & Sports',
    shift: 'Staff',
    email: 'ouk.chenda@school.edu',
    isActive: true,
  },
  {
    id: 'staff-demo-11',
    employeeId: 'T0011',
    name: 'Ly Sovann',
    gender: 'male',
    class: 'Social',
    stream: 'Social',
    subject: 'Life Skills and Career Orientation',
    shift: 'Staff',
    email: 'ly.sovann@school.edu',
    isActive: true,
  },
  {
    id: 'staff-demo-12',
    employeeId: 'T0012',
    name: 'Moung Dara',
    gender: 'male',
    class: 'Science',
    stream: 'Science',
    subject: 'Earth & Environmental Science',
    shift: 'Staff',
    email: 'moung.dara@school.edu',
    isActive: true,
  },
];

function seedDemoData() {
  localStorage.setItem('students_local_v2', JSON.stringify(DEMO_CLASS12_STUDENTS));
  localStorage.setItem('teachers_local_v1', JSON.stringify(DEMO_CLASS12_STAFF));
}

function PrivateRoute({ children, allowedRoles }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length) {
    const currentRole = normalizeRole(user?.role);
    if (!allowedRoles.includes(currentRole)) {
      return <Navigate to={getRoleHomePath(currentRole)} replace />;
    }
  }

  return children;
}

export function AppRoutes() {
  const { isAuthenticated, user, loading } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          loading ? (
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : isAuthenticated ? (
            <Navigate to={getRoleHomePath(user?.role)} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute
            allowedRoles={[ACCOUNT_ROLES.STUDENT, ACCOUNT_ROLES.TEACHER, ACCOUNT_ROLES.ADMIN]}
          >
            <Layout>
              <DashboardPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <PrivateRoute allowedRoles={[ACCOUNT_ROLES.TEACHER, ACCOUNT_ROLES.ADMIN]}>
            <Layout>
              <AttendancePage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/students"
        element={
          <PrivateRoute allowedRoles={[ACCOUNT_ROLES.ADMIN]}>
            <Layout>
              <StudentsPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/student-lookup"
        element={
          <PrivateRoute allowedRoles={[ACCOUNT_ROLES.ADMIN]}>
            <Layout>
              <StudentLookupPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/schedule"
        element={
          <PrivateRoute
            allowedRoles={[ACCOUNT_ROLES.STUDENT, ACCOUNT_ROLES.TEACHER, ACCOUNT_ROLES.ADMIN]}
          >
            <Layout>
              <SchedulePage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/marksheets"
        element={
          <PrivateRoute allowedRoles={[ACCOUNT_ROLES.STUDENT, ACCOUNT_ROLES.ADMIN]}>
            <Layout>
              <MarksheetsPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/assignments"
        element={
          <PrivateRoute allowedRoles={[ACCOUNT_ROLES.STUDENT, ACCOUNT_ROLES.TEACHER]}>
            <Layout>
              <AssignmentsPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/exams"
        element={
          <PrivateRoute
            allowedRoles={[ACCOUNT_ROLES.STUDENT, ACCOUNT_ROLES.TEACHER, ACCOUNT_ROLES.ADMIN]}
          >
            <Layout>
              <ExamsPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <PrivateRoute allowedRoles={[ACCOUNT_ROLES.ADMIN]}>
            <Layout>
              <ReportsPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute
            allowedRoles={[ACCOUNT_ROLES.STUDENT, ACCOUNT_ROLES.TEACHER, ACCOUNT_ROLES.ADMIN]}
          >
            <Layout>
              <ProfilePage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const rawBase = process.env.PUBLIC_URL;
  const routerBase = rawBase && rawBase !== '.' ? rawBase : '/';

  useEffect(() => {
    try {
      if (localStorage.getItem(STUDENT_DATA_RESET_KEY) === 'done') return;
      STUDENT_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
      seedDemoData();
      localStorage.setItem(STUDENT_DATA_RESET_KEY, 'done');
    } catch (_error) {
      // Ignore storage cleanup failures.
    }
  }, []);

  return (
    <BrowserRouter basename={routerBase}>
      <ThemeProvider>
        <AuthProvider>
          <AttendanceProvider>
            <AuthRoutes />
          </AttendanceProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
