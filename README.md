# GMCA2 Modern Web Application

## Getting Started

There are two ways to run this application:

### Option 1: Using Docker (Recommended)

1. Make sure you have Docker and Docker Compose installed on your system
2. Clone this repository
3. Start the application:
```bash
docker-compose up
```

This will:
- Start a PostgreSQL database
- Run database migrations
- Seed the database
- Start the Next.js development server

The application will be available at [http://localhost:3000](http://localhost:3000)

### Option 2: Local Development

1. Make sure you have:
   - Node.js installed (version specified in package.json)
   - PostgreSQL installed and running
   - Copy `.env.example` to `.env` and update the variables

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

4. Run the development server:
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Login Credentials

After setup, you can use any of these pre-seeded user accounts to login:

### Admin User
- Email: admin@example.com
- Password: admin123
- Role: Administrator

### Employee User
- Email: coordinator@gmca.com
- Password: employee123
- Role: Case Coordinator

### Client Users
1. Insurance Company Representative
   - Email: contact@insuranceco.com
   - Password: client123
   - Company: Global Insurance Co.

2. Hospital Representative
   - Email: contact@hospital.com
   - Password: client123
   - Company: City General Hospital

