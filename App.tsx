import { useState } from 'react';
import { Screen } from './types';
import LandingPage from './components/LandingPage';
import SignUpStep1 from './components/SignUpStep1';
import SignUpStep2 from './components/SignUpStep2';
import Dashboard from './components/Dashboard';
import ScholarshipFinder from './components/ScholarshipFinder';
import JobFinder from './components/JobFinder';
import CVChecker from './components/CVChecker';
import PresentationMaker from './components/PresentationMaker';
import LearningPlan from './components/LearningPlan';
import PlagiarismChecker from './components/PlagiarismChecker';
import HabitTracker from './components/HabitTracker';
import CommunityFeed from './components/CommunityFeed';
import ContactSupport from './components/ContactSupport';
import SignIn from './components/SignIn';
import Blog from './components/Blog';
import AboutUs from './components/AboutUs';
import ProfileSettings from './components/ProfileSettings';
import AdminSidebar from './components/AdminSidebar';
import AdminDashboard from './components/AdminDashboard';
import AdminEmployers from './components/AdminEmployers';
import AdminPricing from './components/AdminPricing';
import AdminUsers from './components/AdminUsers';
import AdminScholarships from './components/AdminScholarships';
import AdminRoles from './components/AdminRoles';
import AdminBlog from './components/AdminBlog';
import AdminTeam from './components/AdminTeam';
import AdminProfile from './components/AdminProfile';
import AdminNotifications from './components/AdminNotifications';
import AdminDemographicsPage from './components/AdminDemographicsPage';
import EmployerDashboard from './components/EmployerDashboard';
import StudentSettings from './components/StudentSettings';
import CareerToolsHub from './components/CareerToolsHub';
import CVBuilderPage from './components/CVBuilderPage';

const ADMIN_SCREENS = new Set([
  Screen.ADMIN_DASHBOARD,
  Screen.ADMIN_EMPLOYERS,
  Screen.ADMIN_PRICING,
  Screen.ADMIN_USERS,
  Screen.ADMIN_SCHOLARSHIPS,
  Screen.ADMIN_ROLES,
  Screen.ADMIN_BLOG,
  Screen.ADMIN_SETTINGS,
  Screen.ADMIN_NOTIFICATIONS,
  Screen.ADMIN_TEAM,
  Screen.ADMIN_DEMOGRAPHICS,
]);

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.LANDING);

  const navigateTo = (screen: Screen) => {
    window.scrollTo(0, 0);
    setCurrentScreen(screen);
  };

  const isAdminScreen = ADMIN_SCREENS.has(currentScreen);

  return (
    <>
      {/* Non-admin screens */}
      {!isAdminScreen && (
        <div className="min-h-screen flex flex-col font-display">
          {currentScreen === Screen.LANDING && <LandingPage navigateTo={navigateTo} />}
          {currentScreen === Screen.SIGNUP_STEP_1 && <SignUpStep1 navigateTo={navigateTo} />}
          {currentScreen === Screen.SIGNUP_STEP_2 && <SignUpStep2 />}
          {currentScreen === Screen.DASHBOARD && <Dashboard navigateTo={navigateTo} />}
          {currentScreen === Screen.SCHOLARSHIPS && <ScholarshipFinder navigateTo={navigateTo} />}
          {currentScreen === Screen.CAREER_TRACKER && <JobFinder navigateTo={navigateTo} />}
          {currentScreen === Screen.ATS_CHECKER && <CVChecker navigateTo={navigateTo} />}
          {currentScreen === Screen.PRESENTATION && <PresentationMaker navigateTo={navigateTo} />}
          {currentScreen === Screen.LEARNING_PLAN && <LearningPlan navigateTo={navigateTo} />}
          {currentScreen === Screen.PLAGIARISM && <PlagiarismChecker navigateTo={navigateTo} />}
          {currentScreen === Screen.HABIT_TRACKER && <HabitTracker navigateTo={navigateTo} />}
          {currentScreen === Screen.COMMUNITY && <CommunityFeed navigateTo={navigateTo} />}
          {currentScreen === Screen.CONTACT && <ContactSupport navigateTo={navigateTo} />}
          {currentScreen === Screen.SIGN_IN && <SignIn navigateTo={navigateTo} />}
          {currentScreen === Screen.BLOG && <Blog navigateTo={navigateTo} />}
          {currentScreen === Screen.ABOUT && <AboutUs navigateTo={navigateTo} />}
          {currentScreen === Screen.PROFILE && <ProfileSettings navigateTo={navigateTo} />}
          {currentScreen === Screen.SETTINGS && <StudentSettings navigateTo={navigateTo} />}
          {currentScreen === Screen.EMPLOYER_DASHBOARD && (
            <EmployerDashboard navigateTo={navigateTo} />
          )}
          {currentScreen === Screen.CAREER_TOOLS && <CareerToolsHub navigateTo={navigateTo} />}
          {currentScreen === Screen.CV_BUILDER && <CVBuilderPage navigateTo={navigateTo} />}
        </div>
      )}

      {/* Admin screens — sidebar stays mounted across all admin pages */}
      {isAdminScreen && (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display overflow-hidden">
          <AdminSidebar currentScreen={currentScreen} navigateTo={navigateTo} />
          <div className="flex flex-1 overflow-hidden">
            {currentScreen === Screen.ADMIN_DASHBOARD && <AdminDashboard navigateTo={navigateTo} />}
            {currentScreen === Screen.ADMIN_EMPLOYERS && <AdminEmployers navigateTo={navigateTo} />}
            {currentScreen === Screen.ADMIN_PRICING && <AdminPricing navigateTo={navigateTo} />}
            {currentScreen === Screen.ADMIN_USERS && <AdminUsers navigateTo={navigateTo} />}
            {currentScreen === Screen.ADMIN_SCHOLARSHIPS && (
              <AdminScholarships navigateTo={navigateTo} />
            )}
            {currentScreen === Screen.ADMIN_ROLES && <AdminRoles navigateTo={navigateTo} />}
            {currentScreen === Screen.ADMIN_BLOG && <AdminBlog navigateTo={navigateTo} />}
            {currentScreen === Screen.ADMIN_TEAM && <AdminTeam navigateTo={navigateTo} />}
            {currentScreen === Screen.ADMIN_SETTINGS && <AdminProfile navigateTo={navigateTo} />}
            {currentScreen === Screen.ADMIN_NOTIFICATIONS && (
              <AdminNotifications navigateTo={navigateTo} />
            )}
            {currentScreen === Screen.ADMIN_DEMOGRAPHICS && (
              <AdminDemographicsPage navigateTo={navigateTo} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
