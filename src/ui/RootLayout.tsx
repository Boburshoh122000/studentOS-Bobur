import { Outlet } from 'react-router-dom';
import { PageProgressBar } from '../../components/ui/PageProgressBar';

export default function RootLayout() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <PageProgressBar />
      <Outlet />
    </div>
  );
}
