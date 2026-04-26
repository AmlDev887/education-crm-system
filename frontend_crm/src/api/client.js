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
 * @property {string}  fullname
 * @property {string}  email
 * @property {string}  phone
 * @property {number}  age
 * @property {'paid'|'unpaid'} status
 * @property {boolean} is_active
 * @property {string}  date_rage
 * @property {string}  last_payment_date
 */

/**
 * @typedef {Object} Course
 * @property {number}  id
 * @property {string}  title
 * @property {string}  description
 * @property {number}  price
 * @property {number}  duration
 */

/**
 * @typedef {Object} Payment
 * @property {number}  id
 * @property {number}  student_id
 * @property {number}  course_id
 * @property {number}  amount
 * @property {string}  payment_date
 */

/**
 * @typedef {Object} Attendance
 * @property {number}  id
 * @property {number}  student_id
 * @property {number}  course_id
 * @property {string}  student_name
 * @property {string}  course_title
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
        fullname: data.fullname,
        email: data.email,
        phone: data.phone || '',
        age: Number(data.age),
        status: data.status,
        is_active: data.is_active,
        last_payment_date: new Date().toISOString(),
        date_rage: data.date_rage
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
      body: JSON.stringify({
        student_id: data.student_id,
        course_id: data.course_id,
        amount: Number(data.amount)
      }),
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
      body: JSON.stringify({
        student_id: data.student_id,
        course_id: data.course_id,
        status: data.status,
        date: data.date || new Date().toISOString().split('T')[0]
      }),
    });
    return handleResponse(response);
  },

  // Dashboard stats
  async getStats() {
    const response = await fetch(`${BASE_URL}/stats`);
    return handleResponse(response);
  },
}