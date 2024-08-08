
# Troute

Simple, opinionated data fetching for the Next.js App router. Write all your queries and mutations in the same place, and use them across Server and Client Components easily.

## What is this?

Server Actions are great for mutations, and are the de facto way of POSTing data in both Server and Client components. It would be great if the same were true for fetching data, and since Server Actions are just *"asynchronous functions executed on the server"* they can be used without issue to fetch data from within Server Components.

Unfortunately, in Client Components using Server Actions to fetch isn't recommended, since under the hood all Server Actions are POST requests and can't make use of caching (and can't send in parallel.) The official recommendation is to create route handlers for each fetch action and use a third-party client fetching library like React Query.

Troute automatically generates these route handlers, and wraps around React Query, allowing you to call server actions to both fetch and mutate data across Client and Server Components easily.

## Example

`queries/user.ts`

```typescript
"use server"

import db from ...

export const getUser = async ({id}: {id: string}) => {
  return await db.findUser(id)
}

export const createUser = async ({name}: {name: string}) => {
  return await db.createUser(name)
}
```

Fetching from a Server Component:

```tsx
import { troute } from '@/troute'

export const User = async () => {
  const user = await troute.getUser.action({id: '123'})

  return <div>{user.name}</div>
}
```

Fetching from a Client Component:

```tsx
"use client"

import { troute } from '@/troute'

export const User = () => {
  const { data: user } = troute.getUser.useQuery({id: '123'})

  return <div>{user.name}</div>
}
```

Mutating from Server or Client Components is as normal:

```tsx
"use server"

import { postUser } from "@/queries/user"

export const CreateUser = () => {
  return (
    <button onClick={() => postUser({name: 'John'})}>
      Create user
    </button>
  )
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

5. Now you can start creating your queries as Server Actions in the `queries` folder (or whatever other name you want):

    `queries/user.ts`

    ```typescript
    "use server"

    import db from ...

    export const getUser = async ({id}: {id: string}) => {
      return await db.findUser(id)
    }

    export const createUser = async ({name}: {name: string}) => {
      return await db.createUser(name)
    }
    ```

6. And make sure to add any fetch queries into the createTroute call in `troute.ts`:

    ```typescript
    import { createTroute } from "@olifog/troute";
    import { getUser } from "@/queries/user";

    export const {GET, troute} = createTroute({
      getUser
    })
    ```

An example app using Troute can be found [here](https://github.com/olifog/troute-example).
