import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Screen } from '../../types';
import AdminSidebar from '../../components/AdminSidebar';
import { screenToPath } from './withNavigate';

const pathToScreen: Record<string, Screen> = {
  '/admin': Screen.ADMIN_DASHBOARD,
  '/admin/employers': Screen.ADMIN_EMPLOYERS,
  '/admin/pricing': Screen.ADMIN_PRICING,
  '/admin/users': Screen.ADMIN_USERS,
  '/admin/scholarships': Screen.ADMIN_SCHOLARSHIPS,
  '/admin/roles': Screen.ADMIN_ROLES,
  '/admin/blog': Screen.ADMIN_BLOG,
  '/admin/team': Screen.ADMIN_TEAM,
  '/admin/settings': Screen.ADMIN_SETTINGS,
  '/admin/notifications': Screen.ADMIN_NOTIFICATIONS,
  '/admin/demographics': Screen.ADMIN_DEMOGRAPHICS,
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentScreen = pathToScreen[location.pathname] ?? Screen.ADMIN_DASHBOARD;

  const navigateTo = (screen: Screen) => {
    window.scrollTo(0, 0);
    navigate(screenToPath[screen] ?? '/admin');
  };

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display overflow-hidden">
      <AdminSidebar currentScreen={currentScreen} navigateTo={navigateTo} />
      <div className="flex flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
