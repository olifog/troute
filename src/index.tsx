import {
  QueryClient,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { NextRequest, NextResponse } from "next/server";
import { TrouteProvider } from "./TrouteProvider";

type QueryFunction = (...args: any[]) => Promise<any>;

type Queries = Record<string, QueryFunction>;

type TrouteResult<T extends Queries> = {
  GET: (request: NextRequest) => Promise<NextResponse>;
  troute: {
    [K in keyof T]: (
      params: Parameters<T[K]>[0],
      options: Omit<
        UseQueryOptions<Awaited<ReturnType<T[K]>>, unknown>,
        "queryKey"
      >
    ) => UseQueryResult<Awaited<ReturnType<T[K]>>, unknown>;
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
        (params, options) => {
          return useQuery({
            queryKey: [queryName, params],
            queryFn: async () => {
              let url = "/api/troute";
              url += `?route=${queryName}`;
              if (params) {
                url += `&input=${JSON.stringify(params)}`;
              }

              const res = await fetch(url.toString());
              return res.json() as Promise<Awaited<ReturnType<typeof query>>>;
            },
            ...options,
          });
        },
      ])
    ) as TrouteResult<T>["troute"],
  };
};

export const queryClient = new QueryClient();

export { TrouteProvider };
