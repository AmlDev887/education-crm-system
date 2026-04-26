/**
 * API Client — src/api/client.js
 * Connected to FastAPI backend on http://localhost:8000
 */

const BASE_URL = 'http://localhost:8000'

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Server Error' }))
    throw new Error(error.detail || 'Ошибка связи с бэкендом')
  }
  return response.json()
}

export const api = {
  // ─── AUTH ──────────────────────────────────────────────────────
  async login(username, password) {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    return handleResponse(response)
  },

  async register(username, password) {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    return handleResponse(response)
  },

  // ─── STUDENTS ──────────────────────────────────────────────────
  async getStudents() {
    const response = await fetch(`${BASE_URL}/students`)
    return handleResponse(response)
  },

  async addStudent(data) {
    const response = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullname: data.fullname,
        email: data.email,
        phone: data.phone || '',
        age: Number(data.age),
        status: data.status,
        is_active: data.is_active ?? true,
        date_rage: data.date_rage || new Date().toISOString(),
        course: data.course,
      }),
    })
    return handleResponse(response)
  },

  // PUT /students/{id} — не реализован в бэкенде.
  // Оставлен чтобы не ломать Students.jsx — вернёт ошибку от сервера.
  async updateStudent(id, data) {
    const response = await fetch(`${BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullname: data.fullname,
        email: data.email,
        phone: data.phone,
        age: Number(data.age),
        status: data.status,
        is_active: data.is_active,
        date_rage: data.date_rage,
      }),
    })
    return handleResponse(response)
  },

  async deleteStudent(id) {
    const response = await fetch(`${BASE_URL}/students/${id}`, {
      method: 'DELETE',
    })
    return handleResponse(response)
  },

  // ─── COURSES ───────────────────────────────────────────────────
  async getCourses() {
    const response = await fetch(`${BASE_URL}/courses`)
    return handleResponse(response)
  },

  // Алиас — на случай если где-то используется getCourse() вместо getCourses()
  async getCourse() {
    const response = await fetch(`${BASE_URL}/courses`)
    return handleResponse(response)
  },

  async getCourseTitles() {
    const response = await fetch(`${BASE_URL}/courses/title`)
    return handleResponse(response)
  },

  // ─── ATTENDANCE ────────────────────────────────────────────────
  async getAttendance() {
    const response = await fetch(`${BASE_URL}/attendance`)
    return handleResponse(response)
  },

  async markAttendance(data) {
    const response = await fetch(`${BASE_URL}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: data.student_id,
        course_id: data.course_id,
        status: data.status,
        date: data.date || new Date().toISOString().split('T')[0],
      }),
    })
    return handleResponse(response)
  },

  // ─── PAYMENTS ──────────────────────────────────────────────────
  // POST /payments не реализован в бэкенде — только GET возвращает []
  async getPayments() {
    const response = await fetch(`${BASE_URL}/payments`)
    return handleResponse(response)
  },

  // Оставлен чтобы не ломать Payments.jsx
  // Вернёт ошибку пока POST /payments не добавлен в бэкенд
  async addPayment(data) {
    const response = await fetch(`${BASE_URL}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: data.student_id,
        course_id: data.course_id,
        amount: Number(data.amount),
      }),
    })
    return handleResponse(response)
  },

  // ─── STATS ─────────────────────────────────────────────────────
  // Бэкенд возвращает заглушку с нулями.
  // Reports.jsx агрегирует данные сам из /students + /courses + /attendance
  async getStats() {
    const response = await fetch(`${BASE_URL}/stats`)
    return handleResponse(response)
  },

  // ─── SETTINGS ──────────────────────────────────────────────────
  // GET/POST /settings не реализованы в бэкенде.
  // Settings.jsx работает с локальными дефолтами — эти методы не падают.
  async getSettings() {
    try {
      const response = await fetch(`${BASE_URL}/settings`)
      if (!response.ok) return {}
      return response.json()
    } catch {
      return {}
    }
  },

  async updateSettings(data) {
    try {
      const response = await fetch(`${BASE_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) return { ok: false }
      return response.json()
    } catch {
      return { ok: false }
    }
  },
}
