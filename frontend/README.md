# Frontend User Directory Application

This is a responsive frontend application that displays and manages user data. It features a table-like layout for user listings and a modal for detailed user information. The application is built with React and TypeScript, styled using CSS Modules, and fetches data from an external API.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [API Information](#api-information)
- [Project Structure](#project-structure)

## Features

- **User List Display**: Table-like layout with columns for name/email, address, phone, website, and company name.
- **User Detail Modal**: Displays comprehensive user information upon clicking a user row, including a map link using geo coordinates.
- **User Management**: Ability to delete users from the list (client-side only).
- **Responsive Design**: Clean, modern interface with proper spacing and adaptability for different screen sizes.
- **Animations**: Subtle animations for modal interactions.

## Prerequisites

Before you begin, ensure you have met the following requirements:

*   **Node.js**: Version 18 or higher.
*   **npm**: Version 8 or higher (comes with Node.js).
*   **Docker Desktop**: Required for Docker deployment.

## Local Development

To run the application locally without Docker:

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <repository-url>
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm start
    ```

    The application will open in your browser at `http://localhost:3000`.

## Docker Deployment

To run the application using Docker:

1.  **Ensure Docker Desktop is running.**

2.  **Navigate to the `frontend` directory:**
    ```bash
    cd frontend
    ```

3.  **Build and run the Docker container using Docker Compose:**
    ```bash
    docker-compose up --build
    ```

    This command will build the Docker image (if not already built or if there are changes) and start the container. The application will be accessible at `http://localhost:3000`.

4.  **To stop the application:**
    Press `Ctrl+C` in the terminal where `docker-compose up` is running.

5.  **To stop and remove containers, networks, and volumes (optional):**
    ```bash
    docker-compose down
    ```

## API Information

The application fetches user data from the following API endpoint:

-   **External API (Default):** `https://jsonplaceholder.typicode.com`

    The `REACT_APP_API_BASE_URL` environment variable is used to configure the API endpoint. In `docker-compose.yml`, this is set to `http://host.docker.internal:3000` if you intend to run a *local backend API* on your host machine at `localhost:3000`. If you solely rely on the external API, you can set this variable directly to `https://jsonplaceholder.typicode.com` in `.env` or `docker-compose.yml`.

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/       # Reusable UI components (e.g., UserTable, UserModal)
│   ├── services/         # API integration and data fetching (e.g., userService)
│   ├── types/            # TypeScript type definitions (e.g., user.types.ts)
│   ├── App.tsx           # Main application component
│   ├── App.module.css    # Global application styles
│   ├── index.tsx         # Entry point of the React application
│   └── ...other files
├── Dockerfile            # Docker configuration for building and running the app
├── docker-compose.yml    # Docker Compose configuration for local development
├── .env                  # Environment variables (e.g., API base URL)
├── package.json
├── package-lock.json
└── README.md
```
