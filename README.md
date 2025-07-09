# Store Ratings App

A full-stack web application for rating stores, featuring role-based access control and a clean, professional codebase.

## Tech Stack
- **Backend:** Express.js (Node.js)
- **Database:** PostgreSQL (local or Supabase)
- **Frontend:** React.js (with Tailwind CSS)
- **Authentication:** JWT (JSON Web Token)

## Features

### User Roles
- **System Administrator:** Manage users and stores, view dashboard stats
- **Normal User:** Register, browse/rate stores, update password
- **Store Owner:** View ratings for their store, see users who rated them

### Core Functionality
- Single login system for all users (role-based access)
- Admin dashboard: total users, stores, ratings
- User registration and login
- Store browsing, searching, and rating (1-5)
- Password update for all users
- Filtering and sorting for all tables
- Professional validation and error handling

## Project Structure

```
├── backend/               # Express.js backend
│   ├── server.js         # Main server entry point
│   ├── package.json      # Backend dependencies
│   ├── routes/           # API route handlers
│   ├── utils/            # Validation utilities
│   ├── middleware/       # Authentication middleware
│   └── config/           # Database configuration
├── frontend/             # React frontend
│   └── client/           # React application
│       ├── src/
│       │   ├── components/    # Reusable components
│       │   ├── pages/         # Page components
│       │   └── AuthContext.js # Auth context
│       └── package.json       # Frontend dependencies
└── package.json          # Root scripts and dev dependencies
```

## Setup Instructions

### 1. Install Dependencies

From the project root:
```sh
npm run install-all
```
This will install dependencies for the root, backend, and frontend.

### 2. Database Setup

You can use either **local PostgreSQL** or **Supabase**. The required schema is provided below.

#### Option A: Local PostgreSQL
1. Install PostgreSQL and create a database (e.g., `store_ratings`).
2. Connect to your database using `psql` or a GUI (like DBeaver).
3. Run the following SQL to create the tables:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(400) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    address VARCHAR(400) NOT NULL,
    owner_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    store_id INTEGER REFERENCES stores(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, store_id)
);
```

#### Option B: Supabase
1. Create a new Supabase project.
2. Use the SQL editor to run the same schema as above.
3. Get your database connection details from the Supabase dashboard.

### 3. Environment Variables

Create a `.env` file in the `backend/` directory with the following:

```
PORT=5000
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=your_db_port
JWT_SECRET=your-secret-key
```

- For Supabase, use the credentials from your project settings.
- For local, use your local PostgreSQL credentials.

### 4. Running the App

**Development (concurrently runs backend and frontend):**
```sh
npm run dev
```

**Backend only:**
```sh
npm run backend
```

**Frontend only:**
```sh
npm run frontend
```

**Build frontend for production:**
```sh
npm run build
```



`

## Scripts (root package.json)
- `install-all`: Installs all dependencies (root, backend, frontend)
- `dev`: Runs backend and frontend together (development)
- `backend`: Runs backend only
- `frontend`: Runs frontend only
- `build`: Builds frontend for production
- `start`: Runs backend in production mode



---
