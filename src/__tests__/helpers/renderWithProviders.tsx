// Renders with fresh memory history (default path: /), plus an optional caller-owned
// QueryClient. Returns render utilities, history and user-event.
// Importing registers React cleanup; never starts auth or clears a supplied client.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory } from "history";
import { PropsWithChildren, ReactElement } from "react";
import { Router } from "react-router-dom";
import { afterEach } from "vitest";

afterEach(cleanup);

export const renderWithProviders = (
  element: ReactElement,
  { path = "/", client }: { path?: string; client?: QueryClient } = {}
) => {
  const history = createMemoryHistory({ initialEntries: [path] });
  const wrapper = ({ children }: PropsWithChildren) => {
    const content = <Router history={history}>{children}</Router>;
    return client ? <QueryClientProvider client={client}>{content}</QueryClientProvider> : content;
  };

  return { ...render(element, { wrapper }), history, user: userEvent.setup() };
};
