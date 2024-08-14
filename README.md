
# Troute

Simple, opinionated data fetching for the Next.js App router. Write all your queries in the same place, and use them across Server and Client Components easily.

## What is this?

Server Actions are great for mutations, and are the de facto way of POSTing data in both Server and Client components. For fetching data, Server Components can just call the query directly - no server action or API route needed. For Client Components though, you have to write route handlers for every single fetch action, and use a third-party client fetching library like React Query. This gets tedious - it would be cool to just be able to call the queries directly like in Server Components!

Troute automatically generates route handlers, and wraps around React Query, allowing you to call those same query functions from Client Components (without having to write all the route handlers.)

## Example

`queries/user.ts`

```typescript
import db from ...

export const getUser = async ({id}: {id: string}) => {
  return await db.findUser(id)
}
```

Fetching from a Server Component:

```tsx
import { getUser } from "@/queries/user"

export const User = async () => {
  const user = await getUser({id: '123'})

  return <div>{user.name}</div>
}
```

Fetching from a Client Component:

```tsx
"use client"

import { troute } from '@/troute'

export const User = () => {
  const { data: user } = troute.getUser({params: {id: '123'}})

  return <div>{user.name}</div>
}
```

## Setup

1. Install Troute:

    ```bash
    npm install @olifog/troute
    ```

2. In your root layout, add a TrouteProvider:

    ```tsx
    import { TrouteProvider } from '@olifog/troute'
    // ...

    export default function App({ Component, pageProps }) {
    // ...
      return (
        <TrouteProvider>
          <Component {...pageProps} />
        </TrouteProvider>
      )
    }
    ```

3. Create an `app/api/troute/route.ts` file:

    ```typescript
    export { GET } from '@/troute'
    ```

4. Create a `troute.ts` file in your project root:

    ```typescript
    import { createTroute } from "@olifog/troute";

    export const {GET, troute} = createTroute({})
    ```

5. Now you can start creating your queries as in the `queries` folder (or whatever other name you want):

    `queries/user.ts`

    ```typescript
    import db from ...

    export const getUser = async ({id}: {id: string}) => {
      return await db.findUser(id)
    }
    ```

6. And add any fetch queries you want to call from the client into the createTroute call in `troute.ts`:

    ```typescript
    import { createTroute } from "@olifog/troute";
    import { getUser } from "@/queries/user";

    export const {GET, troute} = createTroute({
      getUser
    })
    ```

An example app using Troute can be found [here](https://github.com/olifog/troute-example).
