# EduCRM — Educational Center CRM

A modern, dark-themed CRM frontend built with React + Vite + Tailwind CSS.

## Tech Stack

- **React 18** + **Vite 5**
- **Tailwind CSS 3** (dark theme)
- **React Router v6** (client-side routing)
- **Recharts** (charts & analytics)
- **Lucide React** (icons)
- **IBM Plex Mono** + **Syne** (fonts)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open in browser
# http://localhost:5173
```

## Pages

| Route         | Description                                      |
|---------------|--------------------------------------------------|
| `/`           | Dashboard — stats, charts, recent activity       |
| `/students`   | Student list — search, filter, CRUD operations   |
| `/courses`    | Course cards — grid with capacity bars           |
| `/payments`   | Payment ledger — record & track payments         |
| `/attendance` | Attendance tracking — mark present/absent        |
| `/reports`    | Analytics — bar, area, pie charts                |
| `/settings`   | App config — API URL, notifications, theme       |

## Project Structure

```
src/
├── api/
│   └── client.js        ← API layer (swap for real FastAPI calls)
├── store/
│   └── data.js          ← Mock data + mutable in-memory store
├── components/
│   ├── ui.jsx           ← Shared UI components
│   └── Sidebar.jsx      ← Navigation sidebar
├── pages/
│   ├── Dashboard.jsx
│   ├── Students.jsx
│   ├── Courses.jsx
│   ├── Payments.jsx
│   ├── Attendance.jsx
│   ├── Reports.jsx
│   └── Settings.jsx
├── App.jsx              ← Router setup
├── main.jsx             ← Entry point
└── index.css            ← Tailwind + global styles
```

## Connecting to FastAPI

All API calls are in `src/api/client.js`. Each method currently returns mock data.

To connect your FastAPI backend, replace the method bodies:

```js
// BEFORE (mock)
async getStudents() {
  await delay()
  return store.getStudents()
}

// AFTER (FastAPI)
async getStudents() {
  const res = await fetch(`${BASE_URL}/students`)
  if (!res.ok) throw new Error('Failed to fetch students')
  return res.json()
}
```

### Expected FastAPI endpoints

| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | `/students`           | List all students    |
| POST   | `/students`           | Create student       |
| PUT    | `/students/{id}`      | Update student       |
| DELETE | `/students/{id}`      | Delete student       |
| GET    | `/courses`            | List all courses     |
| GET    | `/payments`           | List all payments    |
| POST   | `/payments`           | Record payment       |
| GET    | `/attendance`         | List attendance      |
| POST   | `/attendance`         | Mark attendance      |
| GET    | `/stats`              | Dashboard summary    |

### Student schema (SQLAlchemy model reference)

```python
class Student(Base):
    __tablename__ = "students"
    id       = Column(Integer, primary_key=True)
    name     = Column(String, nullable=False)
    email    = Column(String, unique=True, nullable=False)
    phone    = Column(String)
    course   = Column(String, nullable=False)
    status   = Column(Enum("paid", "unpaid"), default="unpaid")
    enrolled = Column(Date, default=date.today)
    balance  = Column(Integer, default=0)
```

### Course schema

```python
class Course(Base):
    __tablename__ = "courses"
    id         = Column(Integer, primary_key=True)
    title      = Column(String, nullable=False)
    instructor = Column(String)
    price      = Column(Integer)
    duration   = Column(String)
    status     = Column(Enum("active", "upcoming"), default="active")
```

## Build for Production

```bash
npm run build
# Output in /dist — ready to deploy (Nginx, Vercel, Netlify, etc.)
```
