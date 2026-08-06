import React from 'react';

import { FaTelegramPlane } from 'react-icons/fa';
import {
  HiChevronRight,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineShieldCheck,
} from 'react-icons/hi';

const moduleLinks = [
  'Dashboard Overview',
  'Attendance Management',
  'Student Records',
  'Assignments and Marksheets',
  'Exams and Announcements',
  'Reports and Calendar',
];

const governanceLinks = [
  'School administration coordination',
  'Role-based access control',
  'Academic record monitoring',
  'Operational communication support',
];

const supportLinks = [
  'Telegram Admin Center',
  'Technical issue tracking',
  'System feedback channel',
  'Release and maintenance updates',
];

function LinkList({ items }) {
  return (
    <ul className="space-y-2 text-sm text-slate-300">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <HiChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Footer() {
  return (
    <footer className="footer-shell mt-10">
      <div className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-8 px-2 py-2 lg:px-0">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                National Education Portal
              </span>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                High School Class Management System
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400">
                Built as a formal school operations portal for attendance oversight, academic
                coordination, communication management, and institution-level reporting aligned with
                MOEYS standards.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Institutional Support
              </span>
              <div className="mt-3.5 space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <HiOutlineLocationMarker className="mt-0.5 h-4 w-4 text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-white">Phnom Penh, Cambodia</p>
                    <p className="text-slate-400">
                      Formal administrative workspace for high school operations
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <HiOutlineMail className="mt-0.5 h-4 w-4 text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-white">class.management@school.edu</p>
                    <p className="text-slate-400">Official support and coordination channel</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <HiOutlineShieldCheck className="mt-0.5 h-4 w-4 text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-white">Protected Institutional Environment</p>
                    <p className="text-slate-400">
                      Role-based access for administration, teachers, and students
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_280px]">
          <section className="px-1 py-1">
            <p className="footer-panel-title">Core Modules</p>
            <div className="mt-4">
              <LinkList items={moduleLinks} />
            </div>
          </section>

          <section className="px-1 py-1">
            <p className="footer-panel-title">Governance Focus</p>
            <div className="mt-4">
              <LinkList items={governanceLinks} />
            </div>
          </section>

          <section className="px-1 py-1">
            <p className="footer-panel-title">Support Channels</p>
            <div className="mt-4">
              <LinkList items={supportLinks} />
            </div>
          </section>

          <section className="px-1 py-1">
            <p className="footer-panel-title">Quick Access</p>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              Telegram support remains available for fast coordination with the Admin Center and
              technical team.
            </p>
            <a
              href="https://t.me/+I9OUYneewiA0NTc1"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-telegram mt-4 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-transform hover:scale-105"
              aria-label="Open Telegram support"
            >
              <FaTelegramPlane className="h-6 w-6 text-white" />
            </a>
          </section>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-slate-800 pt-5 text-[11px] font-medium text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© High School Administration Portal • Kingdom of Cambodia</p>
          <p>MOEYS Institutional Management Environment</p>
        </div>
      </div>
    </footer>
  );
}
