"use client";

import {
  QueryClient,
  QueryClientConfig,
  QueryClientProvider,
} from "@tanstack/react-query";
import React, { useEffect, useState } from "react";

export const TrouteProvider = ({
  children,
  queryClientConfig,
}: Readonly<{
  children: React.ReactNode;
  queryClientConfig?: QueryClientConfig;
}>) => {
  const [queryClient, setQueryClient] = useState(
    () =>
      new QueryClient(queryClientConfig)
  );

  useEffect(() => {
    const newQueryClient = new QueryClient(queryClientConfig);
    setQueryClient(newQueryClient);
  }, [JSON.stringify(queryClientConfig)]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
