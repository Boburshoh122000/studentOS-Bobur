import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from './ui/RootLayout';
import AdminLayout from './ui/AdminLayout';
import { withNavigate } from './ui/withNavigate';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

import { GlobalLoader } from '../components/ui/GlobalLoader';

function Loader() {
  return <GlobalLoader />;
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

// Admin guard: shows 404 for unauthenticated users AND non-admins.
// Security: never redirects to login for users with no token (prevents URL discovery).
// Recovery: if a token exists but auth failed (e.g. backend cold-start), redirects to
// signin so the user can re-authenticate and return here.
function AdminGuard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Loader />;
  if (!isAuthenticated) {
    // Token present = user was previously logged in (knows URL); recover via signin.
    // No token = unknown visitor probing URLs; show 404 to obscure the route.
    return localStorage.getItem('accessToken') ? (
      <Navigate to="/signin?redirect=%2Fconsole-admin" replace />
    ) : (
      <NotFound />
    );
  }
  if (!user || user.role !== 'ADMIN') return <NotFound />;
  return <AdminLayout />;
}

// Employer guard: shows 404 for unauthenticated users AND non-employers.
function EmployerGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Loader />;
  if (!isAuthenticated) {
    return localStorage.getItem('accessToken') ? (
      <Navigate to="/signin?redirect=%2Fconsole-employer" replace />
    ) : (
      <NotFound />
    );
  }
  if (!user || user.role !== 'EMPLOYER') return <NotFound />;
  // Block access until admin verifies the employer account
  if (user.profile?.verificationStatus !== 'verified') {
    return <Navigate to="/verification-pending" replace />;
  }
  return <>{children}</>;
}

// Helper to retry lazy imports on chunk load errors (e.g., after deployment)
const lazyRetry = (importFn: () => Promise<any>) => {
  return lazy(async () => {
    try {
      return await importFn();
    } catch (error: any) {
      if (
        error.message?.includes('Failed to fetch dynamically imported module') ||
        error.name === 'ChunkLoadError'
      ) {
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
const SignUpStep2 = lazyRetry(() => import('../components/SignUpStep2'));
const VerificationPending = lazyRetry(() => import('../components/VerificationPending'));
const AboutUs = withNavigate(lazyRetry(() => import('../components/AboutUs')));
const Blog = withNavigate(lazyRetry(() => import('../components/Blog')));
const BlogPost = withNavigate(lazyRetry(() => import('../components/BlogPost')));
const ContactSupport = withNavigate(lazyRetry(() => import('../components/ContactSupport')));
const TermsOfService = withNavigate(lazyRetry(() => import('../components/TermsOfService')));
const PrivacyPolicy = withNavigate(lazyRetry(() => import('../components/PrivacyPolicy')));
const AuthCallback = lazyRetry(() => import('../components/AuthCallback'));

// App (Student)
const Dashboard = withNavigate(lazyRetry(() => import('../components/Dashboard')));
const ScholarshipFinder = withNavigate(lazyRetry(() => import('../components/ScholarshipFinder')));
const ScholarshipDetail = withNavigate(lazyRetry(() => import('../components/ScholarshipDetail')));
const CareerTracker = withNavigate(lazyRetry(() => import('../components/CareerTracker')));
const CVChecker = withNavigate(lazyRetry(() => import('../components/CVChecker')));
const CVBuilderPage = withNavigate(lazyRetry(() => import('../components/CVBuilderPage')));

const LearningPlan = withNavigate(lazyRetry(() => import('../components/LearningPlan')));
const PlagiarismChecker = withNavigate(lazyRetry(() => import('../components/PlagiarismChecker')));
const HabitTracker = withNavigate(lazyRetry(() => import('../components/HabitTracker')));
const CareerToolsHub = withNavigate(lazyRetry(() => import('../components/CareerToolsHub')));
const AcademicToolsHub = withNavigate(lazyRetry(() => import('../components/AcademicToolsHub')));
const CommunityFeed = withNavigate(lazyRetry(() => import('../components/CommunityFeed')));
const ProfileSettings = withNavigate(lazyRetry(() => import('../components/ProfileSettings')));
const UserProfile = withNavigate(lazyRetry(() => import('../components/UserProfile')));
const StudentSettings = withNavigate(lazyRetry(() => import('../components/StudentSettings')));

// Admin
const AdminDashboard = withNavigate(lazyRetry(() => import('../components/AdminDashboard')));
const AdminEmployers = withNavigate(lazyRetry(() => import('../components/AdminEmployers')));
const AdminPricing = withNavigate(lazyRetry(() => import('../components/AdminPricing')));
const AdminUsers = withNavigate(lazyRetry(() => import('../components/AdminUsers')));
const AdminScholarships = withNavigate(lazyRetry(() => import('../components/AdminScholarships')));
const AdminRoles = withNavigate(lazyRetry(() => import('../components/AdminRoles')));
const AdminBlog = withNavigate(lazyRetry(() => import('../components/AdminBlog')));
const AdminTeam = withNavigate(lazyRetry(() => import('../components/AdminTeam')));
const AdminProfile = withNavigate(lazyRetry(() => import('../components/AdminProfile')));
const AdminNotifications = withNavigate(
  lazyRetry(() => import('../components/AdminNotifications'))
);
const AdminDemographicsPage = withNavigate(
  lazyRetry(() => import('../components/AdminDemographicsPage'))
);

// Employer
const EmployerDashboard = withNavigate(lazyRetry(() => import('../components/EmployerDashboard')));

// Helper component to wrap protected student routes
function StudentRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['STUDENT', 'EDUCATOR', 'ADMIN']}>
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
        path: '/auth/callback',
        element: (
          <Wrap>
            <AuthCallback />
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
        path: '/verification-pending',
        element: (
          <Wrap>
            <VerificationPending />
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
        path: '/blog/:slug',
        element: (
          <Wrap>
            <BlogPost />
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
      {
        path: '/career-tracker',
        element: (
          <Wrap>
            <CareerTracker />
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
        path: '/app/career-tools',
        element: (
          <StudentRoute>
            <CareerToolsHub />
          </StudentRoute>
        ),
      },
      {
        path: '/app/academic-tools',
        element: (
          <StudentRoute>
            <AcademicToolsHub />
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
        path: '/app/scholarships/:id',
        element: (
          <StudentRoute>
            <ScholarshipDetail />
          </StudentRoute>
        ),
      },
      {
        path: '/app/cv-builder',
        element: (
          <StudentRoute>
            <CVBuilderPage />
          </StudentRoute>
        ),
      },
      {
        path: '/app/ats-checker',
        element: (
          <StudentRoute>
            <CVChecker />
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
            <UserProfile />
          </StudentRoute>
        ),
      },
      {
        path: '/app/profile/edit',
        element: (
          <StudentRoute>
            <ProfileSettings />
          </StudentRoute>
        ),
      },
      {
        path: '/app/settings',
        element: (
          <StudentRoute>
            <StudentSettings />
          </StudentRoute>
        ),
      },

      // ========================================
      // SECURE ROUTES - ADMIN (/console-admin/*)
      // Shows 404 for unauthenticated users AND wrong-role users.
      // AdminGuard renders AdminLayout (with Outlet) so sidebar stays mounted.
      // ========================================
      {
        element: <AdminGuard />,
        children: [
          {
            path: '/console-admin',
            element: (
              <Wrap>
                <AdminDashboard />
              </Wrap>
            ),
          },
          {
            path: '/console-admin/employers',
            element: (
              <Wrap>
                <AdminEmployers />
              </Wrap>
            ),
          },
          {
            path: '/console-admin/tools',
            element: (
              <Wrap>
                <AdminPricing />
              </Wrap>
            ),
          },
          {
            path: '/console-admin/users',
            element: (
              <Wrap>
                <AdminUsers />
              </Wrap>
            ),
          },
          {
            path: '/console-admin/scholarships',
            element: (
              <Wrap>
                <AdminScholarships />
              </Wrap>
            ),
          },
          {
            path: '/console-admin/roles',
            element: (
              <Wrap>
                <AdminRoles />
              </Wrap>
            ),
          },
          {
            path: '/console-admin/blog',
            element: (
              <Wrap>
                <AdminBlog />
              </Wrap>
            ),
          },
          {
            path: '/console-admin/team',
            element: (
              <Wrap>
                <AdminTeam />
              </Wrap>
            ),
          },
          {
            path: '/console-admin/settings',
            element: (
              <Wrap>
                <AdminProfile />
              </Wrap>
            ),
          },
          {
            path: '/console-admin/notifications',
            element: (
              <Wrap>
                <AdminNotifications />
              </Wrap>
            ),
          },
          {
            path: '/console-admin/demographics',
            element: (
              <Wrap>
                <AdminDemographicsPage />
              </Wrap>
            ),
          },
        ],
      },

      // Old /admin/* paths → 404 (NOT a redirect — that would reveal the new URL)
      { path: '/admin', element: <NotFound /> },
      { path: '/admin/*', element: <NotFound /> },

      // ========================================
      // SECURE ROUTES - EMPLOYER (/console-employer/*)
      // Shows 404 for unauthenticated users AND wrong-role users.
      // ========================================
      {
        path: '/console-employer',
        element: (
          <EmployerGuard>
            <Wrap>
              <EmployerDashboard />
            </Wrap>
          </EmployerGuard>
        ),
      },

      // Old /employer/* paths → 404
      { path: '/employer', element: <NotFound /> },
      { path: '/employer/*', element: <NotFound /> },

      { path: '*', element: <NotFound /> },
    ],
  },
]);
