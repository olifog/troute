"use client";

import {
  DefaultOptions,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import React, { useEffect, useState } from "react";

export const TrouteProvider = ({
  children,
  defaultOptions,
}: Readonly<{
  children: React.ReactNode;
  defaultOptions?: DefaultOptions<Error>;
}>) => {
  const [queryClient, setQueryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: defaultOptions ?? {},
      })
  );

  useEffect(() => {
    const newQueryClient = new QueryClient({
      defaultOptions: defaultOptions ?? {},
    });
    setQueryClient(newQueryClient);
  }, [JSON.stringify(defaultOptions)]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
