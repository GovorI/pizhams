import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--surface)',
          color: 'var(--text-primary)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-xl)',
          padding: '16px',
          fontSize: '14px',
          fontWeight: 500,
        },
        success: {
          iconTheme: {
            primary: 'var(--success)',
            secondary: 'white',
          },
          style: {
            borderLeft: '4px solid var(--success)',
          },
        },
        error: {
          iconTheme: {
            primary: 'var(--error)',
            secondary: 'white',
          },
          style: {
            borderLeft: '4px solid var(--error)',
          },
        },
        loading: {
          iconTheme: {
            primary: 'var(--primary)',
            secondary: 'white',
          },
          style: {
            borderLeft: '4px solid var(--primary)',
          },
        },
      }}
    />
  );
}
