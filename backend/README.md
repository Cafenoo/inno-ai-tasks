# Node.js Application

## Local Development

1. Start the PostgreSQL database:
```bash
docker-compose up -d postgres
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:3000

## Running Tests

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

## Docker Setup

1. Build and start all containers:
```bash
docker-compose up -d --build
```

2. Stop the containers:
```bash
docker-compose down
```

The application will be available at http://localhost:3000