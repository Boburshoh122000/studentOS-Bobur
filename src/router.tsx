import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import RootLayout from './ui/RootLayout';
import { withNavigate } from './ui/withNavigate';
import { ProtectedRoute } from './components/ProtectedRoute';

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f6f8] dark:bg-[#111421]">
      <div className="flex flex-col items-center gap-4">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading...</p>
      </div>
    </div>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loader />}>{children}</Suspense>;
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f6f8] dark:bg-[#111421]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-300 dark:text-slate-700">404</h1>
        <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">Page not found</p>
        <a href="/" className="mt-6 inline-block text-primary hover:underline font-medium">
          Go back home
        </a>
      </div>
    </div>
  );
}

// Helper to retry lazy imports on chunk load errors (e.g., after deployment)
const lazyRetry = (importFn: () => Promise<any>) => {
  return lazy(async () => {
    try {
      return await importFn();
    } catch (error: any) {
      if (error.message?.includes('Failed to fetch dynamically imported module') || error.name === 'ChunkLoadError') {
         // Prevent infinite reload loop if the file is genuinely missing
         const storageKey = `retry-${error.message}`;
         const hasRetried = sessionStorage.getItem(storageKey);
         
         if (!hasRetried) {
            sessionStorage.setItem(storageKey, 'true');
            window.location.reload();
            // Return a never-resolving promise to wait for reload
            return new Promise(() => {});
         }
      }
      throw error;
    }
  });
};

// Public
const LandingPage = withNavigate(lazyRetry(() => import('../components/LandingPage')));
const SignIn = withNavigate(lazyRetry(() => import('../components/SignIn')));
const SignUpStep1 = withNavigate(lazyRetry(() => import('../components/SignUpStep1')));
const SignUpStep2 = withNavigate(lazyRetry(() => import('../components/SignUpStep2')));
const AboutUs = withNavigate(lazyRetry(() => import('../components/AboutUs')));
const Blog = withNavigate(lazyRetry(() => import('../components/Blog')));
const ContactSupport = withNavigate(lazyRetry(() => import('../components/ContactSupport')));
const TermsOfService = withNavigate(lazyRetry(() => import('../components/TermsOfService')));
const PrivacyPolicy = withNavigate(lazyRetry(() => import('../components/PrivacyPolicy')));

// App (Student)
const Dashboard = withNavigate(lazyRetry(() => import('../components/Dashboard')));
const ScholarshipFinder = withNavigate(lazyRetry(() => import('../components/ScholarshipFinder')));
const JobFinder = withNavigate(lazyRetry(() => import('../components/JobFinder')));
const CVChecker = withNavigate(lazyRetry(() => import('../components/CVChecker')));
const CoverLetterGenerator = withNavigate(lazyRetry(() => import('../components/CoverLetterGenerator')));
const PresentationMaker = withNavigate(lazyRetry(() => import('../components/PresentationMaker')));
const FinanceTracker = withNavigate(lazyRetry(() => import('../components/FinanceTracker')));
const LearningPlan = withNavigate(lazyRetry(() => import('../components/LearningPlan')));
const PlagiarismChecker = withNavigate(lazyRetry(() => import('../components/PlagiarismChecker')));
const HabitTracker = withNavigate(lazyRetry(() => import('../components/HabitTracker')));
const CommunityFeed = withNavigate(lazyRetry(() => import('../components/CommunityFeed')));
const ProfileSettings = withNavigate(lazyRetry(() => import('../components/ProfileSettings')));

// Admin
const AdminDashboard = withNavigate(lazyRetry(() => import('../components/AdminDashboard')));
const AdminEmployers = withNavigate(lazyRetry(() => import('../components/AdminEmployers')));
const AdminPricing = withNavigate(lazyRetry(() => import('../components/AdminPricing')));
const AdminUsers = withNavigate(lazyRetry(() => import('../components/AdminUsers')));
const AdminScholarships = withNavigate(lazyRetry(() => import('../components/AdminScholarships')));
const AdminRoles = withNavigate(lazyRetry(() => import('../components/AdminRoles')));
const AdminBlog = withNavigate(lazyRetry(() => import('../components/AdminBlog')));

// Employer
const EmployerDashboard = withNavigate(lazyRetry(() => import('../components/EmployerDashboard')));

// Helper component to wrap protected routes
function StudentRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
      <Wrap>{children}</Wrap>
    </ProtectedRoute>
  );
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <Wrap>{children}</Wrap>
    </ProtectedRoute>
  );
}

function EmployerRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['EMPLOYER', 'ADMIN']}>
      <Wrap>{children}</Wrap>
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // ========================================
      // PUBLIC ROUTES
      // ========================================
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
        path: '/terms',
        element: (
          <Wrap>
            <TermsOfService />
          </Wrap>
        ),
      },
      {
        path: '/privacy',
        element: (
          <Wrap>
            <PrivacyPolicy />
          </Wrap>
        ),
      },

      // ========================================
      // PROTECTED ROUTES - STUDENT
      // ========================================
      {
        path: '/app',
        element: (
          <StudentRoute>
            <Dashboard />
          </StudentRoute>
        ),
      },
      {
        path: '/app/scholarships',
        element: (
          <StudentRoute>
            <ScholarshipFinder />
          </StudentRoute>
        ),
      },
      {
        path: '/app/jobs',
        element: (
          <StudentRoute>
            <JobFinder />
          </StudentRoute>
        ),
      },
      {
        path: '/app/cv-ats',
        element: (
          <StudentRoute>
            <CVChecker />
          </StudentRoute>
        ),
      },
      {
        path: '/app/cover-letter',
        element: (
          <StudentRoute>
            <CoverLetterGenerator />
          </StudentRoute>
        ),
      },
      {
        path: '/app/presentation',
        element: (
          <StudentRoute>
            <PresentationMaker />
          </StudentRoute>
        ),
      },
      {
        path: '/app/learning-plan',
        element: (
          <StudentRoute>
            <LearningPlan />
          </StudentRoute>
        ),
      },
      {
        path: '/app/finance',
        element: (
          <StudentRoute>
            <FinanceTracker />
          </StudentRoute>
        ),
      },
      {
        path: '/app/plagiarism',
        element: (
          <StudentRoute>
            <PlagiarismChecker />
          </StudentRoute>
        ),
      },
      {
        path: '/app/habit-tracker',
        element: (
          <StudentRoute>
            <HabitTracker />
          </StudentRoute>
        ),
      },
      {
        path: '/app/community',
        element: (
          <StudentRoute>
            <CommunityFeed />
          </StudentRoute>
        ),
      },
      {
        path: '/app/profile',
        element: (
          <StudentRoute>
            <ProfileSettings />
          </StudentRoute>
        ),
      },

      // ========================================
      // PROTECTED ROUTES - ADMIN
      // ========================================
      {
        path: '/admin',
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
      },
      {
        path: '/admin/employers',
        element: (
          <AdminRoute>
            <AdminEmployers />
          </AdminRoute>
        ),
      },
      {
        path: '/admin/pricing',
        element: (
          <AdminRoute>
            <AdminPricing />
          </AdminRoute>
        ),
      },
      {
        path: '/admin/users',
        element: (
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        ),
      },
      {
        path: '/admin/scholarships',
        element: (
          <AdminRoute>
            <AdminScholarships />
          </AdminRoute>
        ),
      },
      {
        path: '/admin/roles',
        element: (
          <AdminRoute>
            <AdminRoles />
          </AdminRoute>
        ),
      },
      {
        path: '/admin/blog',
        element: (
          <AdminRoute>
            <AdminBlog />
          </AdminRoute>
        ),
      },

      // ========================================
      // PROTECTED ROUTES - EMPLOYER
      // ========================================
      {
        path: '/employer',
        element: (
          <EmployerRoute>
            <EmployerDashboard />
          </EmployerRoute>
        ),
      },

      { path: '*', element: <NotFound /> },
    ],
  },
]);
