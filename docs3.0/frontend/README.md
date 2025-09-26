# Frontend

This section covers the frontend architecture, components, and state management.

## Folder Structure

The frontend code is located in the `client/src` directory and follows this structure:

- **`main.tsx`**: The main entry point for the React application.
- **`App.tsx`**: The root component that sets up routing and global layout.
- **`pages/`**: This directory contains the top-level components for each page or route in the application.
- **`components/`**: This directory holds reusable components used across different pages.
  - **`components/ui/`**: A collection of generic, reusable UI components that form the design system.
- **`hooks/`**: This is where custom React hooks are defined to encapsulate and reuse stateful logic.
- **`lib/`**: A utility directory containing various helper modules:
  - `api.ts`: Functions for making API calls to the backend.
  - `queryClient.ts`: Configuration for React Query (TanStack Query).
  - `utils.ts`: General utility functions.
- **`index.css`**: Global stylesheets for the application.

## State Management

The application uses TanStack Query (React Query) for state management.

- **Server State & Caching**: TanStack Query is used for fetching, caching, and updating all data from the server. The global `QueryClient` is configured in `lib/queryClient.ts`.
  - A default query function is set up to handle API requests.
  - Default options are configured to disable aggressive refetching and retries, promoting a more stable cache.

## UI Components

This section is for documenting the reusable UI components found in `src/components/ui/`.

_(This section is a work in progress. Contributions are welcome!)_
