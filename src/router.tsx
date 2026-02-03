import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import RootLayout from './ui/RootLayout';
import { withNavigate } from './ui/withNavigate';

function Loader() {
  return <div style={{ padding: 24 }}>Loading…</div>;
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loader />}>{children}</Suspense>;
}

function NotFound() {
  return <div style={{ padding: 24 }}>404 — Not Found</div>;
}

// Public
const LandingPage = withNavigate(lazy(() => import('../components/LandingPage')));
const SignIn = withNavigate(lazy(() => import('../components/SignIn')));
const SignUpStep1 = withNavigate(lazy(() => import('../components/SignUpStep1')));
const SignUpStep2 = withNavigate(lazy(() => import('../components/SignUpStep2')));
const AboutUs = withNavigate(lazy(() => import('../components/AboutUs')));
const Blog = withNavigate(lazy(() => import('../components/Blog')));
const ContactSupport = withNavigate(lazy(() => import('../components/ContactSupport')));

// App
const Dashboard = withNavigate(lazy(() => import('../components/Dashboard')));
const ScholarshipFinder = withNavigate(lazy(() => import('../components/ScholarshipFinder')));
const JobFinder = withNavigate(lazy(() => import('../components/JobFinder')));
const CVChecker = withNavigate(lazy(() => import('../components/CVChecker')));
const CoverLetterGenerator = withNavigate(lazy(() => import('../components/CoverLetterGenerator')));
const PresentationMaker = withNavigate(lazy(() => import('../components/PresentationMaker')));
const FinanceTracker = withNavigate(lazy(() => import('../components/FinanceTracker')));
const LearningPlan = withNavigate(lazy(() => import('../components/LearningPlan')));
const PlagiarismChecker = withNavigate(lazy(() => import('../components/PlagiarismChecker')));
const HabitTracker = withNavigate(lazy(() => import('../components/HabitTracker')));
const CommunityFeed = withNavigate(lazy(() => import('../components/CommunityFeed')));
const ProfileSettings = withNavigate(lazy(() => import('../components/ProfileSettings')));

// Admin
const AdminDashboard = withNavigate(lazy(() => import('../components/AdminDashboard')));
const AdminEmployers = withNavigate(lazy(() => import('../components/AdminEmployers')));
const AdminPricing = withNavigate(lazy(() => import('../components/AdminPricing')));
const AdminUsers = withNavigate(lazy(() => import('../components/AdminUsers')));
const AdminScholarships = withNavigate(lazy(() => import('../components/AdminScholarships')));
const AdminRoles = withNavigate(lazy(() => import('../components/AdminRoles')));
const AdminBlog = withNavigate(lazy(() => import('../components/AdminBlog')));

// Employer
const EmployerDashboard = withNavigate(lazy(() => import('../components/EmployerDashboard')));

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: (
          <Wrap>
            <LandingPage />
          </Wrap>
        ),
      },
      {
        path: '/signin',
        element: (
          <Wrap>
            <SignIn />
          </Wrap>
        ),
      },
      {
        path: '/signup/step-1',
        element: (
          <Wrap>
            <SignUpStep1 />
          </Wrap>
        ),
      },
      {
        path: '/signup/step-2',
        element: (
          <Wrap>
            <SignUpStep2 />
          </Wrap>
        ),
      },
      {
        path: '/about',
        element: (
          <Wrap>
            <AboutUs />
          </Wrap>
        ),
      },
      {
        path: '/blog',
        element: (
          <Wrap>
            <Blog />
          </Wrap>
        ),
      },
      {
        path: '/contact',
        element: (
          <Wrap>
            <ContactSupport />
          </Wrap>
        ),
      },

      {
        path: '/app',
        element: (
          <Wrap>
            <Dashboard />
          </Wrap>
        ),
      },
      {
        path: '/app/scholarships',
        element: (
          <Wrap>
            <ScholarshipFinder />
          </Wrap>
        ),
      },
      {
        path: '/app/jobs',
        element: (
          <Wrap>
            <JobFinder />
          </Wrap>
        ),
      },
      {
        path: '/app/cv-ats',
        element: (
          <Wrap>
            <CVChecker />
          </Wrap>
        ),
      },
      {
        path: '/app/cover-letter',
        element: (
          <Wrap>
            <CoverLetterGenerator />
          </Wrap>
        ),
      },
      {
        path: '/app/presentation',
        element: (
          <Wrap>
            <PresentationMaker />
          </Wrap>
        ),
      },
      {
        path: '/app/learning-plan',
        element: (
          <Wrap>
            <LearningPlan />
          </Wrap>
        ),
      },
      {
        path: '/app/finance',
        element: (
          <Wrap>
            <FinanceTracker />
          </Wrap>
        ),
      },
      {
        path: '/app/plagiarism',
        element: (
          <Wrap>
            <PlagiarismChecker />
          </Wrap>
        ),
      },
      {
        path: '/app/habit-tracker',
        element: (
          <Wrap>
            <HabitTracker />
          </Wrap>
        ),
      },
      {
        path: '/app/community',
        element: (
          <Wrap>
            <CommunityFeed />
          </Wrap>
        ),
      },
      {
        path: '/app/profile',
        element: (
          <Wrap>
            <ProfileSettings />
          </Wrap>
        ),
      },

      {
        path: '/admin',
        element: (
          <Wrap>
            <AdminDashboard />
          </Wrap>
        ),
      },
      {
        path: '/admin/employers',
        element: (
          <Wrap>
            <AdminEmployers />
          </Wrap>
        ),
      },
      {
        path: '/admin/pricing',
        element: (
          <Wrap>
            <AdminPricing />
          </Wrap>
        ),
      },
      {
        path: '/admin/users',
        element: (
          <Wrap>
            <AdminUsers />
          </Wrap>
        ),
      },
      {
        path: '/admin/scholarships',
        element: (
          <Wrap>
            <AdminScholarships />
          </Wrap>
        ),
      },
      {
        path: '/admin/roles',
        element: (
          <Wrap>
            <AdminRoles />
          </Wrap>
        ),
      },
      {
        path: '/admin/blog',
        element: (
          <Wrap>
            <AdminBlog />
          </Wrap>
        ),
      },

      {
        path: '/employer',
        element: (
          <Wrap>
            <EmployerDashboard />
          </Wrap>
        ),
      },

      { path: '*', element: <NotFound /> },
    ],
  },
]);
