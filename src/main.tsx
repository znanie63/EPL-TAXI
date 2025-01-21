import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { FirebaseProvider } from './providers/firebase-provider';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirebaseProvider>
    <App />
    </FirebaseProvider>
  </StrictMode>
);
