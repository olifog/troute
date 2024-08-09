import { QueryClient, useQuery, UseQueryResult } from "@tanstack/react-query";
import { NextRequest, NextResponse } from "next/server";
import { TrouteProvider } from "./TrouteProvider";

type QueryFunction = (...args: any[]) => Promise<any>;

type Queries = Record<string, QueryFunction>;

type TrouteResult<T extends Queries> = {
  GET: (request: NextRequest) => Promise<NextResponse>;
  troute: {
    [K in keyof T]: {
      action: T[K];
      call: T[K];
      useQuery: (
        input: Parameters<T[K]>[0]
      ) => UseQueryResult<Awaited<ReturnType<T[K]>>, unknown>;
    };
  };
};

export const createTroute = <T extends Queries>(
  actions: Record<string, Function>,
  queries: T
): TrouteResult<T> => {

  return {
    GET: async (request: NextRequest) => {
      const searchParams = request.nextUrl.searchParams;
      const route = searchParams.get("route") || "";
      const input = JSON.parse(searchParams.get("input") || "null");
      const query = queries[route as keyof T];

      if (!query) {
        return NextResponse.json({ error: 'No matching query found' }, { status: 404 })
      }
      
      return NextResponse.json(await query(input));
    },
    troute: Object.fromEntries(
      Object.entries(queries).map(([queryName, query]) => [
        queryName,
        {
          call: query,
          action: async (...args) => {
            const action = actions[queryName];
            if (typeof action === 'function') {
              return await action(...args);
            }
            console.warn(`No server action found for ${queryName}. Falling back to a direct call.`);
            return query(...args);
          },
          useQuery: (input: Parameters<typeof query>[0]) => {
            return useQuery({
              queryKey: [queryName, input],
              queryFn: async () => {
                const res = await fetch(
                  `/api/troute?route=${queryName}&input=${encodeURIComponent(
                    JSON.stringify(input)
                  )}`
                );
                return res.json() as Promise<Awaited<ReturnType<typeof query>>>;
              },
            });
          },
        },
      ])
    ) as TrouteResult<T>["troute"],
  };
};

export const queryClient = new QueryClient();

export { TrouteProvider };
