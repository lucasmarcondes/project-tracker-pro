import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';

import { App } from './App';
import { theme } from './theme';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <MantineProvider defaultColorScheme="dark" theme={theme}>
        <Notifications position="bottom-right" zIndex={1000} />
        <App />
      </MantineProvider>
    </StrictMode>,
  );
}
