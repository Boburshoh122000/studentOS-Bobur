import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Screen } from '../../types';
import AdminSidebar from '../../components/AdminSidebar';
import { screenToPath } from './withNavigate';

const pathToScreen: Record<string, Screen> = {
  '/console-admin': Screen.ADMIN_DASHBOARD,
  '/console-admin/employers': Screen.ADMIN_EMPLOYERS,
  '/console-admin/tools': Screen.ADMIN_TOOLS,
  '/console-admin/users': Screen.ADMIN_USERS,
  '/console-admin/scholarships': Screen.ADMIN_SCHOLARSHIPS,
  '/console-admin/roles': Screen.ADMIN_ROLES,
  '/console-admin/blog': Screen.ADMIN_BLOG,
  '/console-admin/team': Screen.ADMIN_TEAM,
  '/console-admin/settings': Screen.ADMIN_SETTINGS,
  '/console-admin/notifications': Screen.ADMIN_NOTIFICATIONS,
  '/console-admin/demographics': Screen.ADMIN_DEMOGRAPHICS,
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentScreen = pathToScreen[location.pathname] ?? Screen.ADMIN_DASHBOARD;

  const navigateTo = (screen: Screen) => {
    window.scrollTo(0, 0);
    navigate(screenToPath[screen] ?? '/console-admin');
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
