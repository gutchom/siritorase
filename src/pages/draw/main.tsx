import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Drawing from '@/features/Drawing';
import '@/global.css';

const root = document.getElementById('root');
if (!root) throw new Error('root element not found');

createRoot(root).render(
  <StrictMode>
    <Drawing />
  </StrictMode>,
);
