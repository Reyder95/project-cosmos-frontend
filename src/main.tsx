import '@mantine/core/styles.css';

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { MantineProvider } from '@mantine/core';
import { createBrowserRouter, RouterProvider } from 'react-router';
import GalaxyEditor from './Pages/GalaxyEditor.tsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/galaxy-editor',
    element: <GalaxyEditor />
  }
])


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider>
      <RouterProvider router={router} />
    </MantineProvider>
  </StrictMode>,
)
