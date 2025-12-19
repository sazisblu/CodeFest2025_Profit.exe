# Hamro Chautari Backend

Express.js + TypeScript backend for Hamro Chautari.

## Quick Start

```bash
cd backend
npm install
npm run dev
```

The server will start on http://localhost:3000

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests

## API Endpoints

- `GET /health` - Health check
- `GET /api` - Welcome message

## Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```