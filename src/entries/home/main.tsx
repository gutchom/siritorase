import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Home from '@/features/Home';
import 'src/index.css';

const root = document.getElementById('root');
if (!root) throw new Error('root element not found');

createRoot(root).render(
  <StrictMode>
    <Home />
  </StrictMode>,
);
