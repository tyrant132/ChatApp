# ChatApp

A real-time 1-to-1 chat application built with the MERN stack, Socket.IO, and Redis. Users connect with each other using a unique "connect code" (instead of open friend search), then chat in real time with typing indicators, unread counts, and online/offline presence.

## Features

- **Authentication** — register/login with JWT stored in an HTTP-only cookie, protected routes via middleware
- **Connect codes** — every user gets a unique code others can use to send a connection request (no public user search)
- **Real-time messaging** — powered by Socket.IO, messages appear instantly for both participants
- **Typing indicators** — see when the other person is typing
- **Read receipts / unread counts** — per-conversation unread counters, marked as read on open
- **Online presence** — Redis-backed session tracking broadcasts online/offline status to your conversation partners
- **Toast notifications & sound** — UI feedback via Sonner, notification sound on new messages

## Tech Stack

**Backend**
- Node.js + Express 5
- Socket.IO 4 (WebSockets)
- MongoDB + Mongoose
- Redis (online presence / session tracking)
- JWT auth (`jsonwebtoken`, `cookie-parser`, `bcryptjs`)

**Frontend**
- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- Zustand (state management)
- TanStack Query (data fetching/caching)
- React Router 7
- React Hook Form + Zod (form handling/validation)
- Axios, Socket.IO client, Sonner (toasts), lucide-react (icons)

## Project Structure

```
ChatApp/
├── backend/
│   ├── controllers/       # Route handlers (auth, conversations, messages)
│   ├── middlewares/       # authMiddleware (JWT verification)
│   ├── models/             # Mongoose schemas: User, Conversation, Message, Friendship
│   ├── routes/              # Express routers
│   ├── services/           # RedisService (presence/session tracking)
│   ├── socket/              # Socket auth middleware + real-time event handlers
│   ├── utils/                # DB connection, connect-code generator, seed data
│   ├── docker-compose.yaml  # MongoDB + Redis containers for local dev
│   ├── server.js             # App entry point
│   └── socket.js             # Socket.IO event wiring
└── frontend/
    ├── src/
    │   ├── components/     # Sidebar, ChatWindow, UI primitives
    │   ├── contexts/         # Socket + Conversations React contexts
    │   ├── hooks/             # useAuth, useConversations, useMessages, socket listeners
    │   ├── pages/             # Auth, Chat pages
    │   ├── services/         # API service layer (Axios)
    │   ├── stores/            # Zustand stores (auth, conversations)
    │   └── utils/              # apiClient (Axios instance)
    └── vite.config.ts
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm
- [MongoDB](https://www.mongodb.com/) instance
- [Redis](https://redis.io/) instance
- [Docker](https://www.docker.com/) (optional, for spinning up Mongo/Redis quickly via the included `docker-compose.yaml`)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/tyrant132/ChatApp.git
cd ChatApp
```

### 2. Start MongoDB & Redis (optional, via Docker)

The backend includes a `docker-compose.yaml` that spins up both services:

```bash
cd backend
docker compose up -d
```

This starts:
- MongoDB on `localhost:27017`
- Redis on `localhost:6379`

If you already have Mongo/Redis running locally or hosted elsewhere, skip this step and point the environment variables (below) at them instead.

### 3. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with the following variables:

| Variable        | Description                                      | Example                                  |
|-----------------|---------------------------------------------------|-------------------------------------------|
| `PORT`          | Port the API/Socket.IO server runs on              | `4000`                                     |
| `CLIENT_ORIGIN` | Frontend origin, used for CORS                     | `http://localhost:5173`                    |
| `MONGO_URI`     | MongoDB connection string                          | `mongodb://localhost:27017/chatty`         |
| `JWT_SECRET`    | Secret used to sign JWTs — use a long random value | *(generate your own — see note below)*     |
| `REDIS_URI`     | Redis connection string                            | `redis://localhost:6379`                   |

Start the server (with auto-restart via nodemon):

```bash
npm run dev
```

### 4. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/` with:

| Variable        | Description                | Example                          |
|-----------------|-----------------------------|-----------------------------------|
| `VITE_API_URL`  | Base URL of the backend API | `http://localhost:4000/api`      |

Start the dev server:

```bash
npm run dev
```

By default the app will be available at **http://localhost:5173**.

## Available Scripts

**Backend** (`backend/package.json`)
| Script        | Description                    |
|---------------|----------------------------------|
| `npm run dev` | Start server with nodemon        |

**Frontend** (`frontend/package.json`)
| Script            | Description                          |
|-------------------|----------------------------------------|
| `npm run dev`     | Start Vite dev server                  |
| `npm run build`   | Type-check and build for production    |
| `npm run preview` | Preview the production build locally   |
| `npm run lint`    | Run ESLint                             |

## API Reference

All REST routes are prefixed with `/api`. Routes marked 🔒 require a valid JWT (sent automatically as an HTTP-only cookie once logged in).

### Auth (`/api/auth`)
| Method | Endpoint      | Description                     |
|--------|----------------|----------------------------------|
| POST   | `/register`    | Create a new account             |
| POST   | `/login`       | Log in, sets auth cookie         |
| POST   | `/logout` 🔒   | Log out, clears auth cookie      |
| GET    | `/me` 🔒       | Get the current authenticated user |

### Conversations (`/api/conversations`)
| Method | Endpoint                | Description                                             |
|--------|--------------------------|-----------------------------------------------------------|
| GET    | `/check-connect-code` 🔒 | Validate another user's connect code before requesting a chat |
| GET    | `/` 🔒                   | List all conversations for the current user               |

### Messages (`/api/conversations`)
| Method | Endpoint                    | Description                          |
|--------|-------------------------------|-----------------------------------------|
| GET    | `/:conversationId/messages` 🔒 | Fetch message history for a conversation |

## Real-Time Events (Socket.IO)

The client authenticates the socket connection using the same JWT cookie. Events are namespaced under `conversation:`.

**Client → Server**
| Event                          | Payload                                    | Description                                  |
|--------------------------------|----------------------------------------------|-------------------------------------------------|
| `conversation:request`         | `{ connectCode }`                            | Send a connection request using someone's connect code — creates a `Friendship` + `Conversation` on success |
| `conversation:mark-as-read`    | `{ conversationId, friendId }`               | Mark a conversation's unread count as read       |
| `conversation:send-message`    | `{ conversationId, friendId, content }`      | Send a message                                    |
| `conversation:typing`          | `{ friendId, isTyping }`                     | Broadcast typing state to the other participant   |

**Server → Client**
| Event                                | Description                                       |
|---------------------------------------|-----------------------------------------------------|
| `conversation:accept`                 | Emitted to both users when a connection request succeeds |
| `conversation:new-message`            | A new message was sent in a conversation you're part of |
| `conversation:update-conversation`    | Conversation preview/unread counts updated          |
| `conversation:update-unread-counts`   | Unread counts updated after marking as read         |
| `conversation:update-typing`          | The other participant's typing state changed        |
| `conversation:online-status`          | A friend's online/offline status changed            |
| `conversation:request:error`          | Error response for `conversation:request`           |
| `conversation:mark-as-read:error`     | Error response for `conversation:mark-as-read`       |
| `conversation:send-message:error`     | Error response for `conversation:send-message`       |

## Security Note

- Generate a fresh `JWT_SECRET` (e.g. `openssl rand -hex 64`) and rotate it outside of source control
