# Running Locally

This section explains how to run the application in a production-like local environment.

## Prerequisites

- Node.js and npm installed.

## Building for Production

1.  **Build the Application**:
    - Run the following command from the project root to build the frontend and backend:
      ```bash
      npm run build
      ```
    - This will create a `dist` folder with the compiled application.

## Running the Production Build

1.  **Start the Server**:

    - Once the build is complete, start the server with:
      ```bash
      npm run start
      ```
    - This will run the application in production mode, serving the built frontend from the Express server.

2.  **Accessing the Application**:
    - Open your web browser and navigate to the URL provided in the console (typically `http://localhost:5081`).
    - To access the application from other devices on the same local network, use the server's local IP address (e.g., `http://192.168.1.100:5081`).
