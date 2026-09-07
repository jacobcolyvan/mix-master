// Fresh real QueryClients and hook wrappers, without auth startup.
// Retries are disabled and GC timers suppressed. Importing registers React cleanup
// followed by clearing every client this module creates after each test.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup } from "@testing-library/react";
import { PropsWithChildren } from "react";
import { afterEach } from "vitest";

const clients: QueryClient[] = [];

afterEach(() => {
  cleanup();
  clients.splice(0).forEach((client) => client.clear());
});

export const createQueryTestContext = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  clients.push(client);

  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return { client, wrapper };
};
