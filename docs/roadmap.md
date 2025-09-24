## Roadmap

This document outlines the planned future development for the application, focusing on short-term improvements, potential architectural migrations, and performance optimizations.

### Short-term Goals
- **Enhanced Error Handling**: Implement React Error Boundaries on the frontend to gracefully handle rendering errors. Improve the detail and clarity of API error messages returned from the backend.
- **Backend Testing**: Increase test coverage for the storage layer, with a focus on critical business logic such as FIFO inventory consumption, sales processing, and cash session management.

### Architectural Migrations

These are longer-term considerations for evolving the application's architecture.

#### Styling Migration
- **Goal**: Transition from Tailwind CSS to CSS Modules.
- **Rationale**: CSS Modules would provide locally scoped styles by default, reducing the risk of class name collisions and improving maintainability as the application grows. This aligns with the user rule to use modulated CSS.
- **Approach**:
  - Keep the semantic structure provided by `shadcn/ui` components.
  - Port existing Tailwind/`shadcn` design tokens to CSS custom properties (variables) for consistent styling.
  - Incrementally refactor components to use CSS Modules.

#### Astro Migration
- **Goal**: Convert the React application to an Astro project.
- **Rationale**: Astro's island architecture would allow for a more performant frontend by shipping less JavaScript. Static content would be rendered to HTML at build time, and interactive components ("islands") would be hydrated on the client side as needed.
- **Approach**:
  - Convert existing React routes/pages to Astro pages.
  - Wrap interactive UI sections in React components and use them as islands within the Astro pages.
  - The Express API server would remain as-is and could be deployed as a separate service or integrated with Astro's server-side rendering capabilities.

### Performance Optimizations
- **Database Indexing**: Add indexes to frequently queried columns in the database, particularly foreign keys and date/timestamp fields used for filtering, to improve query performance.
- **HTTP Caching**: Configure appropriate HTTP caching headers for static assets (CSS, JS, images) to reduce load times for returning visitors.


