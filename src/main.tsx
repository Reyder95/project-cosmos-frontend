import '@mantine/core/styles.css';

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { Button, createTheme, MantineProvider } from '@mantine/core';
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

const theme = createTheme({
    components: {
        Button: Button.extend({
          vars: (theme, props) => {
            if (props.variant === 'editor') {
              return {
                root: {
                  '--button-bg': '#2a3147',
                  '--button-hover': '#3a4460',
                  '--button-color': '#a8b8d8',
                }
              }
            }
            return { root: {} }
          }
        }),
    },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <RouterProvider router={router} />
    </MantineProvider>
  </StrictMode>,
)
