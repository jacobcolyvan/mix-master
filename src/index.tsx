import ReactDOM from 'react-dom';
import './stylesheets/global.scss';
import './stylesheets/pages.scss';
import './stylesheets/components.scss';

import App from './App';
import dotenv from 'dotenv';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { CookiesProvider } from 'react-cookie';

import { Provider } from 'react-redux';
import { store } from './app/store';

const theme = createTheme({
  palette: {
    type: 'dark',
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

dotenv.config();
ReactDOM.render(
  <Provider store={store}>
    <CookiesProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </CookiesProvider>
  </Provider>,
  document.getElementById('root')
);
