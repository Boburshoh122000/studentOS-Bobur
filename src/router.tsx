import { createBrowserRouter } from 'react-router-dom';
import RootLayout from './ui/RootLayout';
import App from '../App';

function NotFound() {
  return <div style={{ padding: 24 }}>404 — Not Found</div>;
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <App /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
