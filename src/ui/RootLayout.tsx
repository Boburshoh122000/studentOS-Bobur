import { Outlet } from 'react-router-dom';

export default function RootLayout() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Outlet />
    </div>
  );
}
