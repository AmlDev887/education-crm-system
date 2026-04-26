import { useState, useEffect, useMemo } from 'react'
import { Users, BookOpen, DollarSign, TrendingUp, AlertCircle, CheckCircle, ArrowUpRight } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid
} from 'recharts'
import { api } from '@/api/client'
import { Badge, Avatar, getCourseColor, fmtM, Spinner } from '@/components/ui'
import { PageHeader } from '@/components/ui'

// ─── Tooltip ─────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-3 border border-border-2 rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="font-mono text-txt-muted mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color }} className="font-mono">
          {p.name}: {p.dataKey === 'revenue' ? fmtM(p.value) + 'M' : p.value}
        </div>
      ))}
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent, sub, delta }) {
  return (
    <div className="card flex-1 p-5 min-w-[160px]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-mono text-txt-dim uppercase tracking-widest">{label}</span>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: accent + '20' }}>
          <Icon size={13} style={{ color: accent }} />
        </div>
      </div>
      <div className="text-2xl font-bold font-mono" style={{ color: accent }}>{value}</div>
      {sub && <div className="text-xs text-txt-muted mt-1">{sub}</div>}
      {delta !== undefined && delta !== 0 && (
        <div className="flex items-center gap-1 mt-1 text-[11px] text-success font-mono">
          <ArrowUpRight size={11} /> +{delta} this month
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────
export default function Dashboard() {
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      api.getStudents(),
      api.getCourses(),
      api.getAttendance(),
    ])
      .then(([s, c, a]) => {
        setStudents(s)
        setCourses(c)
        setAttendance(a)
      })
      .catch(err => {
        console.error('Dashboard load error:', err)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  // ─── Агрегация статистики ─────────────────────────────────────
  const stats = useMemo(() => {
    const totalStudents = students.length
    const activeStudents = students.filter(s => s.is_active).length
    const paidStudents = students.filter(s => s.status === 'paid').length
    const unpaidStudents = students.filter(s => s.status === 'unpaid').length

    const totalPresent = attendance.filter(a => a.status === 'present').length
    const totalAbsent = attendance.filter(a => a.status === 'absent').length
    const attendanceRate = attendance.length > 0
      ? Math.round((totalPresent / attendance.length) * 100)
      : 0

    // Примерная выручка
    const totalRevenue = courses.reduce((acc, c) => {
      const count = students.filter(s => s.course === c.title && s.status === 'paid').length
      return acc + (c.price || 0) * count
    }, 0)

    // Новые студенты за текущий месяц
    const now = new Date()
    const newThisMonth = students.filter(s => {
      const d = new Date(s.date_rage)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length

    return {
      totalStudents,
      activeStudents,
      paidStudents,
      unpaidStudents,
      totalPresent,
      totalAbsent,
      attendanceRate,
      totalRevenue,
      newThisMonth,
      activeCourses: courses.length,
    }
  }, [students, courses, attendance])

  // ─── Monthly chart data ───────────────────────────────────────
  const monthlyData = useMemo(() => {
    const map = {}
    students.forEach(s => {
      const d = new Date(s.date_rage)
      if (isNaN(d)) return
      const key = d.toLocaleString('en', { month: 'short' })
      if (!map[key]) map[key] = { month: key, students: 0, revenue: 0 }
      map[key].students++
      const course = courses.find(c => c.title === s.course)
      if (s.status === 'paid') map[key].revenue += course?.price || 0
    })
    return Object.values(map)
  }, [students, courses])

  // ─── Attendance monthly ───────────────────────────────────────
  const attendanceMonthly = useMemo(() => {
    const map = {}
    attendance.forEach(r => {
      const d = new Date(r.date)
      const key = d.toLocaleString('en', { month: 'short' })
      if (!map[key]) map[key] = { month: key, present: 0, absent: 0 }
      if (r.status === 'present') map[key].present++
      else map[key].absent++
    })
    return Object.values(map).slice(-6)
  }, [attendance])

  // ─── Course attendance rates ──────────────────────────────────
  const courseStats = useMemo(() => {
    return courses.map(c => {
      const recs = attendance.filter(a => a.course_id === c.id)
      const present = recs.filter(a => a.status === 'present').length
      const rate = recs.length > 0 ? Math.round((present / recs.length) * 100) : 0
      const studentCount = students.filter(s => s.course === c.title).length
      return { ...c, attendanceRate: rate, studentCount }
    })
  }, [courses, attendance, students])

  // ─── Recent attendance logs ───────────────────────────────────
  const recentLogs = useMemo(() => [...attendance].reverse().slice(0, 6), [attendance])

  // ─── Recent students ──────────────────────────────────────────
  const recentStudents = useMemo(() =>
    [...students]
      .sort((a, b) => new Date(b.date_rage) - new Date(a.date_rage))
      .slice(0, 5),
    [students]
  )

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>
  if (error) return (
    <div className="p-8 text-danger font-mono text-center">⚠ {error}</div>
  )

  return (
    <div className="p-8 max-w-[1200px] animate-fade-in">
      <PageHeader tag="Overview" title="Dashboard" />

      {/* ── Stat Cards ─────────────────────────────────────────── */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <StatCard
          label="Total Students"
          value={stats.totalStudents}
          icon={Users}
          accent="#7c3aed"
          sub={`${stats.activeStudents} active`}
          delta={stats.newThisMonth}
        />
        <StatCard
          label="Active Courses"
          value={stats.activeCourses}
          icon={BookOpen}
          accent="#38bdf8"
          sub="In database"
        />
        <StatCard
          label="Est. Revenue"
          value={fmtM(stats.totalRevenue) + 'M'}
          icon={DollarSign}
          accent="#10b981"
          sub="UZS from paid students"
        />
        <StatCard
          label="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          icon={TrendingUp}
          accent="#a78bfa"
          sub={`${stats.totalPresent} present / ${stats.totalAbsent} absent`}
        />
      </div>

      {/* ── Payment status bar ─────────────────────────────────── */}
      <div className="card p-4 mb-6 flex items-center gap-6">
        <div className="text-xs font-mono text-txt-dim uppercase tracking-widest">Payment Status</div>
        <div className="flex-1 h-2 bg-bg-4 rounded-full overflow-hidden">
          <div
            className="h-full bg-success rounded-full transition-all duration-700"
            style={{ width: `${stats.totalStudents > 0 ? (stats.paidStudents / stats.totalStudents) * 100 : 0}%` }}
          />
        </div>
        <div className="flex items-center gap-4 text-xs font-mono flex-shrink-0">
          <span className="flex items-center gap-1.5 text-success">
            <CheckCircle size={11} /> {stats.paidStudents} paid
          </span>
          <span className="flex items-center gap-1.5 text-danger">
            <AlertCircle size={11} /> {stats.unpaidStudents} unpaid
          </span>
        </div>
      </div>

      {/* ── Charts Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-sm font-semibold">Student Registrations</div>
              <div className="text-xs text-txt-muted mt-0.5">New enrollments per month</div>
            </div>
            <Badge>{new Date().getFullYear()}</Badge>
          </div>
          {monthlyData.length === 0 ? (
            <div className="text-xs text-txt-dim font-mono py-12 text-center">No registration data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyData} barSize={22}>
                <CartesianGrid strokeDasharray="2 4" stroke="#1e1e28" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#696874', fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#696874', fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.06)' }} />
                <Bar dataKey="students" name="Students" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <div className="text-sm font-semibold mb-1">Attendance Trend</div>
          <div className="text-xs text-txt-muted mb-5">Present per month</div>
          {attendanceMonthly.length === 0 ? (
            <div className="text-xs text-txt-dim font-mono py-12 text-center">No attendance data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={attendanceMonthly}>
                <defs>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: '#696874', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#282835' }} />
                <Area type="monotone" dataKey="present" name="Present" stroke="#10b981" strokeWidth={2} fill="url(#attGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Bottom Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Recent Students */}
        <div className="card">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold">Recent Students</span>
            <span className="text-[11px] text-accent font-mono">{stats.newThisMonth} this month</span>
          </div>
          <div>
            {recentStudents.length === 0 ? (
              <div className="px-5 py-8 text-xs text-txt-dim font-mono text-center">No students yet</div>
            ) : recentStudents.map((s, i, arr) => (
              <div
                key={s.id}
                className={`flex items-center gap-3 px-5 py-3 hover:bg-bg-3 transition-colors ${i < arr.length - 1 ? 'border-b border-border/60' : ''}`}
              >
                <Avatar name={s.fullname} color={getCourseColor?.(s.course) || '#7c3aed'} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{s.fullname}</div>
                  <div className="text-xs text-txt-muted truncate">{s.course || 'No course'}</div>
                </div>
                <Badge type={s.status}>{s.status}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Course Overview */}
        <div className="card">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold">Course Overview</span>
            <span className="text-[11px] text-txt-muted font-mono">{courses.length} courses</span>
          </div>
          <div>
            {courseStats.length === 0 ? (
              <div className="px-5 py-8 text-xs text-txt-dim font-mono text-center">No courses yet</div>
            ) : courseStats.map((c, i, arr) => (
              <div
                key={c.id}
                className={`flex items-center gap-3 px-5 py-3 hover:bg-bg-3 transition-colors ${i < arr.length - 1 ? 'border-b border-border/60' : ''}`}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: courseColor(c.id) }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.title}</div>
                  <div className="text-xs text-txt-muted">{c.studentCount} students</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-medium">{c.attendanceRate}%</div>
                  <div className="text-[10px] text-txt-muted">attendance</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Attendance Logs */}
        <div className="card col-span-2">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold">Recent Attendance Logs</span>
            <span className="text-[11px] text-txt-muted font-mono">{attendance.length} total records</span>
          </div>
          <div>
            {recentLogs.length === 0 ? (
              <div className="px-5 py-8 text-xs text-txt-dim font-mono text-center">No attendance records yet</div>
            ) : recentLogs.map((item, i, arr) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 px-5 py-3 hover:bg-bg-3 transition-colors ${i < arr.length - 1 ? 'border-b border-border/60' : ''}`}
              >
                <Avatar
                  name={item.student_name || item.studentName || '?'}
                  color={getCourseColor?.(item.course_title) || '#7c3aed'}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {item.student_name || item.studentName || '—'}
                  </div>
                  <div className="text-xs text-txt-muted truncate">
                    {item.course_title || item.course || '—'} · {item.date}
                  </div>
                </div>
                <Badge type={item.status === 'present' ? 'paid' : 'unpaid'}>
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

function courseColor(id) {
  const COLORS = ['#7c3aed', '#38bdf8', '#10b981', '#f59e0b', '#f43f5e', '#6366f1']
  return COLORS[(id - 1) % COLORS.length]
}
