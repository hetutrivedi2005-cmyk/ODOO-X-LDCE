# 🌍 ODOO-X-LDCE

Full-stack web application built for the **ODOO-X-LDCE Hackathon**.

## 🛠️ Tech Stack

* Frontend: React + Vite
* Backend: Node.js + Express
* Database: PostgreSQL
* ORM: Prisma
* Authentication: JWT

---

# 🚀 Quick Setup

## 1. Clone Repository

```bash
git clone https://github.com/hetutrivedi2005-cmyk/ODOO-X-LDCE.git
cd ODOO-X-LDCE
```

---

# 🔹 Backend Setup

Open a terminal:

```bash
cd backend
npm install
```

### Create `.env`

Create:

```text
backend/.env
```

Add:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/odoo_x_ldce?schema=public"
JWT_SECRET="your_super_secret_key"
```

Replace:

```text
YOUR_PASSWORD
```

with your PostgreSQL password.

---

## Create Database

Open PostgreSQL / pgAdmin and create:

```sql
CREATE DATABASE odoo_x_ldce;
```

---

## Setup Prisma

Inside the `backend` folder:

```bash
npx prisma generate
```

Then:

```bash
npx prisma migrate dev
```

If Prisma asks for a migration name, enter:

```text
initial_setup
```

---

## Start Backend

```bash
npm run dev
```

Backend should run on:

```text
http://localhost:5000
```

Test:

```text
http://localhost:5000/api/health
```

---

# 🔹 Frontend Setup

Open a **new terminal**.

From the project root:

```bash
cd frontend
npm install
```

Create:

```text
frontend/.env
```

Add:

```env
VITE_API_URL=http://localhost:5000
```

Then start the frontend:

```bash
npm run dev
```

Open the URL shown by Vite, normally:

```text
http://localhost:5173
```

---

# 📂 Project Structure

```text
ODOO-X-LDCE/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── .env
│   ├── package.json
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .env
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

---

# 🔄 Run Project

You need **two terminals**.

### Terminal 1 — Backend

```bash
cd ODOO-X-LDCE/backend
npm install
npx prisma generate
npm run dev
```

### Terminal 2 — Frontend

```bash
cd ODOO-X-LDCE/frontend
npm install
npm run dev
```

---

# 🔐 Environment Variables

## Backend `.env`

```env
PORT=5000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/odoo_x_ldce?schema=public"
JWT_SECRET="your_super_secret_key"
```

## Frontend `.env`

```env
VITE_API_URL=http://localhost:5000
```

> ⚠️ Never upload `.env` files or database passwords to GitHub.

---

# 🧪 API

### Health Check

```http
GET /api/health
```

Response:

```json
{
  "success": true,
  "message": "GlobeTrotter API is running"
}
```

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

---

# 🐛 Troubleshooting

## PostgreSQL Connection Error

Check:

```bash
npx prisma db pull
```

Make sure PostgreSQL is running and your `DATABASE_URL` is correct.

---

## Prisma Error

Run:

```bash
npx prisma generate
npx prisma migrate dev
```

---

## Port Already in Use

Change the backend port in:

```text
backend/.env
```

Example:

```env
PORT=5001
```

Then update frontend:

```env
VITE_API_URL=http://localhost:5001
```

---

## Dependencies Error

Delete `node_modules` and reinstall.

### Windows

```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### Linux / macOS

```bash
rm -rf node_modules
npm install
```

---

# 👨‍💻 Development

Pull latest changes:

```bash
git pull origin main
```

Create a branch:

```bash
git checkout -b feature/your-feature
```

Commit changes:

```bash
git add .
git commit -m "Add feature"
```

Push:

```bash
git push origin feature/your-feature
```

---

# ⭐ Repository

**ODOO-X-LDCE**

https://github.com/hetutrivedi2005-cmyk/ODOO-X-LDCE

---

## 🚀 Ready to Run

After PostgreSQL is configured:

```bash
# Terminal 1
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

```bash
# Terminal 2
cd frontend
npm install
npm run dev
```

**Backend:** `http://localhost:5000`

**Frontend:** `http://localhost:5173`
