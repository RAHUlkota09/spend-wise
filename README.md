# 💸 Expense Tracker — Spring Boot + React (CRA)

Two separate projects:
- `expense-tracker-backend` → Spring Boot 3 REST API (port 8080)
- `expense-tracker-frontend` → React CRA (port 3000)

---

## Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+ & npm
- MySQL 8.x running locally

---

## Backend Setup

### 1. Create MySQL database
```sql
CREATE DATABASE expense_tracker_db;
```

### 2. Update credentials in `application.properties`
```properties
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

### 3. Import into Spring Tool Suite (STS)
- File → Import → Existing Maven Projects → select `expense-tracker-backend`

### 4. Run
```bash
cd expense-tracker-backend
mvn spring-boot:run
```
Backend runs at: `http://localhost:8080`

---

## Frontend Setup

### 1. Install dependencies
```bash
cd expense-tracker-frontend
npm install
```

### 2. Start the dev server
```bash
npm start
```
Frontend runs at: `http://localhost:3000`

The CRA proxy (`"proxy": "http://localhost:8080"` in package.json) forwards all `/api` calls to the backend automatically.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET  | `/api/expenses` | Get all expenses |
| GET  | `/api/expenses?category=Food` | Filter by category |
| POST | `/api/expenses` | Add expense |
| PUT  | `/api/expenses/{id}` | Update expense |
| DELETE | `/api/expenses/{id}` | Delete expense |
| GET  | `/api/expenses/summary` | Dashboard summary |

All expense endpoints require: `Authorization: Bearer <token>`

---

## Features
- JWT Authentication (login/register)
- Full CRUD for expenses
- Dashboard with Pie + Bar charts (Recharts)
- Category filtering
- Dark themed UI (DM Sans + Playfair Display)
- React Router v6 protected routes
- Toast notifications
