// Renders with a fresh Redux store and memory history (default path: /), plus an
// optional caller-owned QueryClient. Returns render utilities, store, history and user-event.
// Importing registers React cleanup; never starts auth or clears a supplied client.
import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory } from "history";
import { PropsWithChildren, ReactElement } from "react";
import { Provider } from "react-redux";
import { Router } from "react-router-dom";
import { afterEach } from "vitest";

import controlsSlice from "../../slices/controlsSlice";
import settingsSlice from "../../slices/settingsSlice";

afterEach(cleanup);

export const renderWithProviders = (
  element: ReactElement,
  { path = "/", client }: { path?: string; client?: QueryClient } = {}
) => {
  const store = configureStore({ reducer: { controlsSlice, settingsSlice } });
  const history = createMemoryHistory({ initialEntries: [path] });

  const wrapper = ({ children }: PropsWithChildren) => {
    const content = (
      <Provider store={store}>
        <Router history={history}>{children}</Router>
      </Provider>
    );
    return client ? <QueryClientProvider client={client}>{content}</QueryClientProvider> : content;
  };

  return { ...render(element, { wrapper }), store, history, user: userEvent.setup() };
};
