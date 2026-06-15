import "./stylesheets/global.scss";
import "./stylesheets/pages.scss";
import "./stylesheets/components.scss";

import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import App from "./App";
import { store } from "./app/store";
import { bootstrap, subscribe } from "./auth";
import { setSessionReady, setSpotifyToken, setUsername } from "./slices/settingsSlice";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#1E2327",
    },
    text: {
      primary: "#C1CFDE",
      secondary: "#C1CFDE",
    },
    primary: {
      main: "#7986CB",
    },
  },
});

// The single auth wiring point: mirror token changes into Redux (so components
// re-render on login/logout), then run bootstrap once at module load.
subscribe((token) => {
  store.dispatch(setSpotifyToken(token));
  // clear username on logout (UI concern)
  if (!token) store.dispatch(setUsername(""));
});
bootstrap().finally(() => store.dispatch(setSessionReady(true)));

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </Provider>
);
