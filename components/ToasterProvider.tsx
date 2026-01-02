'use client';

import { Toaster } from 'react-hot-toast';

const ToasterProvider = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      duration: 3000,
      style: {
        background: '#111827',
        color: '#f9fafb',
        border: '1px solid rgba(148, 163, 184, 0.2)',
      },
    }}
  />
);

export default ToasterProvider;
