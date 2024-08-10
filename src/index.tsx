import { QueryClient, useQuery, UseQueryResult } from "@tanstack/react-query";
import { NextRequest, NextResponse } from "next/server";
import { TrouteProvider } from "./TrouteProvider";

type QueryFunction = (...args: any[]) => Promise<any>;

type Queries = Record<string, QueryFunction>;

type TrouteResult<T extends Queries> = {
  GET: (request: NextRequest) => Promise<NextResponse>;
  troute: {
    [K in keyof T]: (input: {
      params?: Parameters<T[K]>[0];
      enabled?: boolean;
    }) => UseQueryResult<Awaited<ReturnType<T[K]>>, unknown>;
  };
};

export const createTroute = <T extends Queries>(
  queries: T
): TrouteResult<T> => {
  return {
    GET: async (request: NextRequest) => {
      const searchParams = request.nextUrl.searchParams;
      const route = searchParams.get("route") || "";
      const input = JSON.parse(searchParams.get("input") || "null");
      const query = queries[route as keyof T];

      if (!query) {
        return NextResponse.json(
          { error: "No matching query found" },
          { status: 404 }
        );
      }

      return NextResponse.json(await query(input));
    },
    troute: Object.fromEntries(
      Object.entries(queries).map(([queryName, query]) => [
        queryName,
        ({
          params,
          enabled = true,
        }: {
          params?: Parameters<typeof query>[0];
          enabled?: boolean;
        }) => {
          return useQuery({
            queryKey: [queryName, params],
            queryFn: async () => {
              console.log("fetching", queryName, params);
              const url = new URL("/api/troute");
              url.searchParams.set("route", queryName);
              if (params) {
                url.searchParams.set("input", JSON.stringify(params));
              }

              console.log(url.toString());

              const res = await fetch(url.toString());

              return res.json() as Promise<Awaited<ReturnType<typeof query>>>;
            },
            enabled,
          });
        },
      ])
    ) as TrouteResult<T>["troute"],
  };
};

export const queryClient = new QueryClient();

export { TrouteProvider };
