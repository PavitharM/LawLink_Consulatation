# LawLink Backend

This is the Node.js/Express backend for LawLink, handling authentication, role-based access control, and database operations.

## Technology Stack

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma Client
- **Authentication**: JSON Web Tokens (JWT) & bcrypt
- **Validation**: Zod
- **Security**: Helmet, CORS, Express Rate Limit

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema definitions
│   └── seed.ts            # Seed script for initial data
├── src/
│   ├── config/            # Env variables and static config
│   ├── controllers/       # HTTP request handlers (auth, users, etc.)
│   ├── middleware/        # Express middleware (auth, validate, errors)
│   ├── routes/            # Express routers and endpoints
│   ├── utils/             # Helper functions (JWT, error classes)
│   ├── validators/        # Zod validation schemas
│   ├── app.ts             # Express app instance setup
│   └── server.ts          # Server entry point
├── .env                   # Local environment variables
└── tsconfig.json          # TypeScript configuration
```

## Setup & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Make sure your `.env` file is set up correctly (a `.env.example` is provided). You must define a `DATABASE_URL` for PostgreSQL.

### 3. Database Initialization
Run the Prisma migrations to set up your PostgreSQL database schema:
```bash
npx prisma migrate dev --name init
```

Generate the Prisma Client:
```bash
npx prisma generate
```

### 4. Seed the Database
Seed the database with the initial Administrator account and default legal packages:
```bash
npm run seed
```

### 5. Running the Application

**Development Mode** (Hot Reloading via nodemon):
```bash
npm run dev
```

**Production Mode**:
```bash
npm run build
npm start
```

## Default Accounts (Seed Data)
- **Admin**: `admin@lawlink.in` | Password: `admin123`

## API Endpoints Overview
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register a new user/lawyer
- `GET /api/users/me` - Get current profile
- `GET /api/complaints` - List complaints (filtered by role)
- `GET /api/packages` - List service packages
- `GET /api/articles` - List published articles
