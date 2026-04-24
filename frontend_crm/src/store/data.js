// ─── MOCK DATABASE ───────────────────────────────────────────────
// Replace these with real API calls when FastAPI backend is ready.

export const COURSES = [
  { id: 1, title: 'UI/UX Design',      instructor: 'Sarvar Nazarov',   students: 24, duration: '3 months', price: 1200000, status: 'active',   color: '#7c3aed', tag: 'Design' },
  { id: 2, title: 'Python Backend',    instructor: 'Nilufar Yusupova', students: 18, duration: '4 months', price: 1500000, status: 'active',   color: '#38bdf8', tag: 'Engineering' },
  { id: 3, title: 'Data Science',      instructor: 'Akbar Tursunov',   students: 12, duration: '5 months', price: 1800000, status: 'active',   color: '#10b981', tag: 'Analytics' },
  { id: 4, title: 'React Frontend',    instructor: 'Zulfiya Kamolov',  students: 20, duration: '3 months', price: 1200000, status: 'active',   color: '#f59e0b', tag: 'Engineering' },
  { id: 5, title: 'Mobile Dev',        instructor: 'Timur Holmatov',   students: 8,  duration: '4 months', price: 1400000, status: 'upcoming', color: '#f43f5e', tag: 'Engineering' },
  { id: 6, title: 'Cybersecurity',     instructor: 'Barno Mirzayeva',  students: 10, duration: '6 months', price: 2000000, status: 'upcoming', color: '#6366f1', tag: 'Security' },
]

let _studentId = 100
export const STUDENTS = [
  { id: 1,  name: 'Aisha Karimova',    email: 'aisha@mail.com',    phone: '+998901234567', course: 'UI/UX Design',   status: 'paid',   enrolled: '2024-09-01', balance: 0 },
  { id: 2,  name: 'Bobur Tashmatov',   email: 'bobur@mail.com',    phone: '+998901234568', course: 'Python Backend', status: 'unpaid', enrolled: '2024-09-03', balance: 1500000 },
  { id: 3,  name: 'Camila Torres',     email: 'camila@mail.com',   phone: '+998901234569', course: 'Data Science',   status: 'paid',   enrolled: '2024-09-05', balance: 0 },
  { id: 4,  name: 'Daniyal Yusupov',   email: 'daniyal@mail.com',  phone: '+998901234570', course: 'React Frontend', status: 'paid',   enrolled: '2024-09-08', balance: 0 },
  { id: 5,  name: 'Elena Petrova',     email: 'elena@mail.com',    phone: '+998901234571', course: 'UI/UX Design',   status: 'unpaid', enrolled: '2024-09-10', balance: 1200000 },
  { id: 6,  name: 'Farhan Malik',      email: 'farhan@mail.com',   phone: '+998901234572', course: 'Python Backend', status: 'paid',   enrolled: '2024-09-12', balance: 0 },
  { id: 7,  name: 'Gulnora Rashidova', email: 'gulnora@mail.com',  phone: '+998901234573', course: 'Data Science',   status: 'paid',   enrolled: '2024-09-15', balance: 0 },
  { id: 8,  name: 'Hamid Azimov',      email: 'hamid@mail.com',    phone: '+998901234574', course: 'React Frontend', status: 'unpaid', enrolled: '2024-09-18', balance: 1200000 },
  { id: 9,  name: 'Iroda Sultanova',   email: 'iroda@mail.com',    phone: '+998901234575', course: 'UI/UX Design',   status: 'paid',   enrolled: '2024-10-01', balance: 0 },
  { id: 10, name: 'Jasur Normatov',    email: 'jasur@mail.com',    phone: '+998901234576', course: 'Python Backend', status: 'paid',   enrolled: '2024-10-03', balance: 0 },
  { id: 11, name: 'Kamola Umarova',    email: 'kamola@mail.com',   phone: '+998901234577', course: 'Cybersecurity',  status: 'unpaid', enrolled: '2024-10-05', balance: 2000000 },
  { id: 12, name: 'Laziz Rakhimov',    email: 'laziz@mail.com',    phone: '+998901234578', course: 'Data Science',   status: 'paid',   enrolled: '2024-10-08', balance: 0 },
]

export const PAYMENTS = [
  { id: 1,  studentId: 1,  studentName: 'Aisha Karimova',    course: 'UI/UX Design',   amount: 1200000, date: '2024-09-01', method: 'card',  status: 'paid' },
  { id: 2,  studentId: 3,  studentName: 'Camila Torres',     course: 'Data Science',   amount: 1800000, date: '2024-09-05', method: 'cash',  status: 'paid' },
  { id: 3,  studentId: 4,  studentName: 'Daniyal Yusupov',   course: 'React Frontend', amount: 1200000, date: '2024-09-08', method: 'card',  status: 'paid' },
  { id: 4,  studentId: 2,  studentName: 'Bobur Tashmatov',   course: 'Python Backend', amount: 1500000, date: '2024-09-10', method: 'cash',  status: 'pending' },
  { id: 5,  studentId: 6,  studentName: 'Farhan Malik',      course: 'Python Backend', amount: 1500000, date: '2024-09-12', method: 'card',  status: 'paid' },
  { id: 6,  studentId: 7,  studentName: 'Gulnora Rashidova', course: 'Data Science',   amount: 1800000, date: '2024-09-15', method: 'transfer', status: 'paid' },
  { id: 7,  studentId: 5,  studentName: 'Elena Petrova',     course: 'UI/UX Design',   amount: 1200000, date: '2024-09-20', method: 'card',  status: 'pending' },
  { id: 8,  studentId: 9,  studentName: 'Iroda Sultanova',   course: 'UI/UX Design',   amount: 1200000, date: '2024-10-01', method: 'cash',  status: 'paid' },
  { id: 9,  studentId: 10, studentName: 'Jasur Normatov',    course: 'Python Backend', amount: 1500000, date: '2024-10-03', method: 'card',  status: 'paid' },
  { id: 10, studentId: 12, studentName: 'Laziz Rakhimov',    course: 'Data Science',   amount: 1800000, date: '2024-10-08', method: 'card',  status: 'paid' },
]

export const ATTENDANCE = [
  { id: 1,  studentId: 1,  studentName: 'Aisha Karimova',    course: 'UI/UX Design',   date: '2024-11-04', status: 'present' },
  { id: 2,  studentId: 2,  studentName: 'Bobur Tashmatov',   course: 'Python Backend', date: '2024-11-04', status: 'absent'  },
  { id: 3,  studentId: 3,  studentName: 'Camila Torres',     course: 'Data Science',   date: '2024-11-04', status: 'present' },
  { id: 4,  studentId: 4,  studentName: 'Daniyal Yusupov',   course: 'React Frontend', date: '2024-11-04', status: 'present' },
  { id: 5,  studentId: 5,  studentName: 'Elena Petrova',     course: 'UI/UX Design',   date: '2024-11-04', status: 'present' },
  { id: 6,  studentId: 6,  studentName: 'Farhan Malik',      course: 'Python Backend', date: '2024-11-04', status: 'absent'  },
  { id: 7,  studentId: 7,  studentName: 'Gulnora Rashidova', course: 'Data Science',   date: '2024-11-04', status: 'present' },
  { id: 8,  studentId: 8,  studentName: 'Hamid Azimov',      course: 'React Frontend', date: '2024-11-04', status: 'absent'  },
  { id: 9,  studentId: 9,  studentName: 'Iroda Sultanova',   course: 'UI/UX Design',   date: '2024-11-05', status: 'present' },
  { id: 10, studentId: 10, studentName: 'Jasur Normatov',    course: 'Python Backend', date: '2024-11-05', status: 'present' },
]

export const MONTHLY_STATS = [
  { month: 'Sep', students: 8,  revenue: 9600000  },
  { month: 'Oct', students: 14, revenue: 18000000 },
  { month: 'Nov', students: 11, revenue: 14400000 },
  { month: 'Dec', students: 6,  revenue: 8400000  },
  { month: 'Jan', students: 19, revenue: 24000000 },
  { month: 'Feb', students: 16, revenue: 21600000 },
  { month: 'Mar', students: 23, revenue: 30000000 },
  { month: 'Apr', students: 28, revenue: 36000000 },
]

// ─── MUTABLE STORE ────────────────────────────────────────────────
let students = [...STUDENTS]
let payments = [...PAYMENTS]
let attendance = [...ATTENDANCE]

export const store = {
  // Students
  getStudents: () => [...students],
  addStudent: (data) => {
    const s = { ...data, id: ++_studentId, balance: data.status === 'unpaid' ? (COURSES.find(c=>c.title===data.course)?.price||0) : 0 }
    students.push(s)
    return s
  },
  updateStudent: (id, data) => {
    students = students.map(s => s.id === id ? { ...s, ...data } : s)
    return students.find(s => s.id === id)
  },
  deleteStudent: (id) => { students = students.filter(s => s.id !== id) },

  // Courses (static for now)
  getCourses: () => [...COURSES],

  // Payments
  getPayments: () => [...payments],
  addPayment: (data) => {
    const p = { ...data, id: payments.length + 1, date: new Date().toISOString().slice(0, 10) }
    payments.push(p)
    students = students.map(s => s.id === data.studentId ? { ...s, status: 'paid', balance: 0 } : s)
    return p
  },

  // Attendance
  getAttendance: () => [...attendance],
  markAttendance: (data) => {
    const existing = attendance.find(a => a.studentId === data.studentId && a.date === data.date)
    if (existing) {
      attendance = attendance.map(a => a.id === existing.id ? { ...a, status: data.status } : a)
    } else {
      attendance.push({ ...data, id: attendance.length + 1 })
    }
  },

  // Stats
  getStats: () => {
    const paid = students.filter(s => s.status === 'paid').length
    const unpaid = students.length - paid
    const totalRevenue = payments.filter(p => p.status === 'paid').reduce((a, p) => a + p.amount, 0)
    return { totalStudents: students.length, activeCourses: COURSES.filter(c => c.status === 'active').length, totalRevenue, paid, unpaid }
  },
}
