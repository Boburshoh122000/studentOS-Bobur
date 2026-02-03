
import React, { useState } from 'react';
import { Screen } from './types';
import LandingPage from './components/LandingPage';
import SignUpStep1 from './components/SignUpStep1';
import SignUpStep2 from './components/SignUpStep2';
import Dashboard from './components/Dashboard';
import ScholarshipFinder from './components/ScholarshipFinder';
import JobFinder from './components/JobFinder';
import CVChecker from './components/CVChecker';
import CoverLetterGenerator from './components/CoverLetterGenerator';
import PresentationMaker from './components/PresentationMaker';
import LearningPlan from './components/LearningPlan';
import PlagiarismChecker from './components/PlagiarismChecker';
import FinanceTracker from './components/FinanceTracker';
import HabitTracker from './components/HabitTracker';
import CommunityFeed from './components/CommunityFeed';
import ContactSupport from './components/ContactSupport';
import SignIn from './components/SignIn';
import Blog from './components/Blog';
import AboutUs from './components/AboutUs';
import ProfileSettings from './components/ProfileSettings';
import AdminDashboard from './components/AdminDashboard';
import AdminEmployers from './components/AdminEmployers';
import AdminPricing from './components/AdminPricing';
import AdminUsers from './components/AdminUsers';
import AdminScholarships from './components/AdminScholarships';
import AdminRoles from './components/AdminRoles';
import AdminBlog from './components/AdminBlog';
import EmployerDashboard from './components/EmployerDashboard';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.LANDING);

  const navigateTo = (screen: Screen) => {
    // Scroll to top when changing screens
    window.scrollTo(0, 0);
    setCurrentScreen(screen);
  };

  return (
    <div className="min-h-screen flex flex-col font-display">
      {currentScreen === Screen.LANDING && (
        <LandingPage navigateTo={navigateTo} />
      )}
      {currentScreen === Screen.SIGNUP_STEP_1 && (
        <SignUpStep1 navigateTo={navigateTo} />
      )}
      {currentScreen === Screen.SIGNUP_STEP_2 && (
        <SignUpStep2 navigateTo={navigateTo} />
      )}
      {currentScreen === Screen.DASHBOARD && (
        <Dashboard navigateTo={navigateTo} />
      )}
      {currentScreen === Screen.SCHOLARSHIPS && (
        <ScholarshipFinder navigateTo={navigateTo} />
      )}
      {currentScreen === Screen.JOBS && (
        <JobFinder navigateTo={navigateTo} />
      )}
      {currentScreen === Screen.CV_ATS && (
        <CVChecker navigateTo={navigateTo} />
      )}
      {currentScreen === Screen.COVER_LETTER && (
        <CoverLetterGenerator navigateTo={navigateTo} />
      )}
      {currentScreen === Screen.PRESENTATION && (
        <PresentationMaker navigateTo={navigateTo} />
      )}
      {currentScreen === Screen.LEARNING_PLAN && (
        <LearningPlan navigateTo={navigateTo} />
      )}
      {currentScreen === Screen.PLAGIARISM && (
        <PlagiarismChecker navigateTo={navigateTo} />
      )}
      {currentScreen === Screen.FINANCE && (
        <FinanceTracker navigateTo={navigateTo} />
      )}
      {currentScreen === Screen.HABIT_TRACKER && (
        <HabitTracker navigateTo={navigateTo} />
      )}
      {currentScreen === Screen.COMMUNITY && (
        <CommunityFeed navigateTo={navigateTo} />
      )}
      {currentScreen === Screen.CONTACT && (
        <ContactSupport navigateTo={navigateTo} />
      )}
      {currentScreen === Screen.SIGN_IN && (
        <SignIn navigateTo={navigateTo} />
      )}
      {currentScreen === Screen.BLOG && (
        <Blog navigateTo={navigateTo} />
      )}
      {currentScreen === Screen.ABOUT && (
        <AboutUs navigateTo={navigateTo} />
      )}
      {currentScreen === Screen.PROFILE && (
        <ProfileSettings navigateTo={navigateTo} />
      )}
      {currentScreen === Screen.ADMIN_DASHBOARD && (
        <AdminDashboard navigateTo={navigateTo} />
      )}
      {currentScreen === Screen.ADMIN_EMPLOYERS && (
        <AdminEmployers navigateTo={navigateTo} />
      )}
      {currentScreen === Screen.ADMIN_PRICING && (
        <AdminPricing navigateTo={navigateTo} />
      )}
      {currentScreen === Screen.ADMIN_USERS && (
        <AdminUsers navigateTo={navigateTo} />
      )}
      {currentScreen === Screen.ADMIN_SCHOLARSHIPS && (
        <AdminScholarships navigateTo={navigateTo} />
      )}
      {currentScreen === Screen.ADMIN_ROLES && (
        <AdminRoles navigateTo={navigateTo} />
      )}
      {currentScreen === Screen.ADMIN_BLOG && (
        <AdminBlog navigateTo={navigateTo} />
      )}
      {currentScreen === Screen.EMPLOYER_DASHBOARD && (
        <EmployerDashboard navigateTo={navigateTo} />
      )}
    </div>
  );
}
