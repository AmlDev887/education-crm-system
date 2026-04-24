const BASE_URL = 'http://127.0.0.1:8000';

export const api = {

  // LOGIN
  async login(data) {
    const r = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: data.username,
        password: data.password
      })
    });

    if (!r.ok) {
      const err = await r.json();
      throw new Error(err.detail || 'Login error');
    }

    return r.json();
  },

  // REGISTER
  async register(data) {
    const r = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: data.username,
        password: data.password
      })
    });

    if (!r.ok) {
      const err = await r.json();
      throw new Error(err.detail || 'Register error');
    }

    return r.json();
  },

  // GET STUDENTS + SEARCH
  async getStudents(q = '') {
    const r = await fetch(`${BASE_URL}/students?q=${q}`);

    if (!r.ok) {
      throw new Error('Error getting students');
    }

    return r.json();
  },

  // ADD STUDENT
  async addStudent(data) {
    const payload = {
      fullname: data.fullname,
      email: data.email,
      phone: data.phone,
      age: Number(data.age),
      status: data.status,
      is_active: data.is_active,
      enrolled: data.enrolled,
      last_payment_date: data.last_payment_date
    };

    const r = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const err = await r.json();
      console.log(err);
      throw new Error('Add student error');
    }

    return r.json();
  },

  // STATS (если есть endpoint)
  async getStats() {
    try {
      const r = await fetch(`${BASE_URL}/stats`);
      if (!r.ok) return null;
      return r.json();
    } catch {
      return null;
    }
  }
};