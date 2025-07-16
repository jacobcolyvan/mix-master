import "./stylesheets/global.scss";
import "./stylesheets/pages.scss";
import "./stylesheets/components.scss";

import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { CookiesProvider } from "react-cookie";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import App from "./App";
import { store } from "./app/store";

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

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <Provider store={store}>
    {/* @ts-expect-error - CookiesProvider compatibility issue with React 18 */}
    <CookiesProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </CookiesProvider>
  </Provider>
);
