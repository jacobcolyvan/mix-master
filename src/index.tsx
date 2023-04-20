import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { CookiesProvider } from 'react-cookie';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

import App from './App';
import { store } from './app/store';

import './stylesheets/global.scss';
import './stylesheets/pages.scss';
import './stylesheets/components.scss';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1E2327',
    },
    text: {
      primary: '#C1CFDE',
      secondary: '#C1CFDE',
    },
    primary: {
      main: '#7986CB',
    },
  },
});

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <Provider store={store}>
    <CookiesProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </CookiesProvider>
  </Provider>
);
