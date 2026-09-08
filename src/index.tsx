import "./stylesheets/global.scss";
import "./stylesheets/pages.scss";
import "./stylesheets/components.scss";

import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";

import App from "./App";
import { bootstrap, logout, subscribe } from "./auth";
import { startCacheLifecycle } from "./queries/cacheLifecycle";
import { createCachePersister } from "./queries/persister";
import { queryClient } from "./queries/queryClient";

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

const cacheLifecycle = startCacheLifecycle({
  client: queryClient,
  persister: createCachePersister(),
  auth: { bootstrap, subscribe, logout },
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    cacheLifecycle.dispose();
  });
}

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App ready={cacheLifecycle.ready} />
    </ThemeProvider>
  </QueryClientProvider>
);
