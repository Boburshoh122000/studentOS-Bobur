import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Tailwind (build-time) and icon fonts — replaces the former CDN <script> tags
import './src/tailwind.css';
import '@phosphor-icons/web/regular';
import '@phosphor-icons/web/bold';
import '@phosphor-icons/web/fill';

// Initialize i18n before anything renders
import './src/i18n';

import { router } from './src/router';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { CreditProvider } from './src/contexts/CreditContext';
import AutoLogoutProvider from './components/providers/AutoLogoutProvider';
import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" enableSystem={false}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AutoLogoutProvider>
              <CreditProvider>
                <RouterProvider router={router} />
              </CreditProvider>
            </AutoLogoutProvider>
          </AuthProvider>
          <Toaster position="top-right" />
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
