/**
 * API Client — src/api/client.js
 * Connected to FastAPI backend on http://localhost:8000
 */

const BASE_URL = 'http://localhost:8000'

/**
 * Единая обертка для всех HTTP-запросов к бэкенду.
 * Автоматически передает Cookie (credentials: 'include') и обрабатывает ошибки.
 */
async function request(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  }

  const config = {
    ...options,
    credentials: 'include', // Передача HTTP-only Cookie на бэкенд
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Ошибка сервера' }))
    throw new Error(error.detail || 'Ошибка связи с бэкендом')
  }

  return response.json()
}

export const api = {
  // ─── AUTH ──────────────────────────────────────────────────────
  async login(username, password) {
    return request('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  },

  async register(username, password) {
    return request('/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  },

  // ─── STUDENTS ──────────────────────────────────────────────────
  async getStudents() {
    return request('/students')
  },

  async addStudent(data) {
    return request('/students', {
      method: 'POST',
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
  },

  async updateStudent(id, data) {
    return request(`/students/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async deleteStudent(id) {
    return request(`/students/${id}`, {
      method: 'DELETE',
    })
  },

  // ─── COURSES ───────────────────────────────────────────────────
  async getCourses() {
    return request('/courses')
  },

  async getCourse() {
    return request('/courses')
  },

  async getCourseTitles() {
    return request('/courses/title')
  },

  // ─── ATTENDANCE ────────────────────────────────────────────────
  async getAttendance() {
    return request('/attendance')
  },

  async markAttendance(data) {
    return request('/attendance', {
      method: 'POST',
      body: JSON.stringify({
        student_id: data.student_id,
        course_id: data.course_id,
        status: data.status,
        date: data.date || new Date().toISOString().split('T')[0],
      }),
    })
  },

  // ─── PAYMENTS ──────────────────────────────────────────────────
  async getPayments() {
    return request('/payments')
  },

  async updatePaymentStatus(id, newStatus) {
    return request(`/payments/${id}/status?new_status=${newStatus}`, {
      method: 'PATCH',
    })
  },

  async addPayment(data) {
    return request('/payments', {
      method: 'POST',
      body: JSON.stringify({
        student_id: data.student_id,
        course_id: data.course_id,
        amount: Number(data.amount),
      }),
    })
  },

  // ─── STATS ─────────────────────────────────────────────────────
  async getStats() {
    return request('/stats')
  },

  // ─── SETTINGS ──────────────────────────────────────────────────
  async getSettings() {
    try {
      return await request('/settings')
    } catch {
      return {}
    }
  },

  async updateSettings(data) {
    try {
      return await request('/settings', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch {
      return { ok: false }
    }
  },
}