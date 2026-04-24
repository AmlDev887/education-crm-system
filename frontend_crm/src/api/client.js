/**
 * API Client — src/api/client.js
 *
 * Connected to FastAPI backend on http://localhost:8000
 */

const BASE_URL = 'http://localhost:8000'

/**
 * Вспомогательная функция для обработки ответов от сервера
 */
async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Server Error' }));
    throw new Error(error.detail || 'Ошибка связи с бэкендом');
  }
  return response.json();
}

// ─── TypeScript-style JSDoc interfaces ────────────────────────────
/**
 * @typedef {Object} Student
 * @property {number}  id
 * @property {string}  name
 * @property {string}  email
 * @property {string}  phone
 * @property {string}  course
 * @property {'paid'|'unpaid'} status
 * @property {string}  enrolled   — ISO date YYYY-MM-DD
 * @property {number}  balance    — amount owed in UZS
 */

/**
 * @typedef {Object} Course
 * @property {number}  id
 * @property {string}  title
 * @property {string}  instructor
 * @property {number}  students
 * @property {string}  duration
 * @property {number}  price
 * @property {'active'|'upcoming'} status
 * @property {string}  color
 * @property {string}  tag
 */

/**
 * @typedef {Object} Payment
 * @property {number}  id
 * @property {number}  studentId
 * @property {string}  studentName
 * @property {string}  course
 * @property {number}  amount
 * @property {string}  date
 * @property {'card'|'cash'|'transfer'} method
 * @property {'paid'|'pending'} status
 */

/**
 * @typedef {Object} Attendance
 * @property {number}  id
 * @property {number}  studentId
 * @property {string}  studentName
 * @property {string}  course
 * @property {string}  date
 * @property {'present'|'absent'} status
 */

// ─── API METHODS ──────────────────────────────────────────────────
export const api = {
  // Students
  async getStudents() {
    const response = await fetch(`${BASE_URL}/students`);
    return handleResponse(response);
  },

  async getCourse() {
    const response = await fetch(`${BASE_URL}/courses`);
    return handleResponse(response);
  },

  async getCourseTitles() {
    const response = await fetch(`${BASE_URL}/courses/title`);
    return handleResponse(response);
  },

  async addStudent(data) {
    const response = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullname: data.fullname,    // Используем данные из обновленной формы
        email: data.email,
        phone: data.phone || '',
        age: Number(data.age),      // Теперь возраст динамический
        course: data.course,
        status: data.status,
        is_active: data.is_active,  // Учитываем статус активности
        last_payment_date: new Date().toISOString(),
        date_rage: data.date_rage   // ISO строка
      }),
    });
    return handleResponse(response);
  },

  async updateStudent(id, data) {
    const response = await fetch(`${BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullname: data.fullname,
        email: data.email,
        phone: data.phone,
        age: Number(data.age),
        course: data.course,
        status: data.status,
        is_active: data.is_active,
        date_rage: data.date_rage
      }),
    });
    return handleResponse(response);
  },

  async deleteStudent(id) {
    const response = await fetch(`${BASE_URL}/students/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // Courses
  async getCourses() {
    const response = await fetch(`${BASE_URL}/courses`);
    return handleResponse(response);
  },

  // Payments
  async getPayments() {
    const response = await fetch(`${BASE_URL}/payments`);
    return handleResponse(response);
  },

  async addPayment(data) {
    const response = await fetch(`${BASE_URL}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Attendance
  async getAttendance() {
    const response = await fetch(`${BASE_URL}/attendance`);
    return handleResponse(response);
  },

  async markAttendance(data) {
    const response = await fetch(`${BASE_URL}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Dashboard stats
  async getStats() {
    const response = await fetch(`${BASE_URL}/stats`);
    return handleResponse(response);
  },
}