import { useState, useEffect, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
} from 'recharts'
import { api } from '@/api/client'
import { PageHeader, Spinner } from '@/components/ui'

const PIE_COLORS = ['#7c3aed', '#38bdf8', '#10b981', '#f59e0b', '#f43f5e', '#6366f1']

function fmtM(v) {
  if (!v) return '0'
  return (v / 1_000_000).toFixed(1)
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-3 border border-border-2 rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="font-mono text-txt-muted mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color }} className="font-mono">
          {p.name}: {p.dataKey === 'revenue' ? fmtM(p.value) + 'M UZS' : p.value}
        </div>
      ))}
    </div>
  )
}

export default function Reports() {
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Берём реальные данные из трёх эндпоинтов вместо заглушки /stats
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
        console.error('Reports load error:', err)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  // ─── Агрегация всей статистики на фронте ──────────────────────
  const data = useMemo(() => {
    if (!students.length && !courses.length) return null

    const paidCount = students.filter(s => s.status === 'paid').length
    const unpaidCount = students.filter(s => s.status === 'unpaid').length
    const totalStudents = students.length

    // Суммарная выручка = сумма price всех курсов × кол-во студентов на курсе
    const totalRevenue = courses.reduce((acc, c) => {
      const count = students.filter(s => s.course === c.title).length
      return acc + (c.price || 0) * count
    }, 0)

    // Распределение студентов по курсам
    const coursesDistribution = courses.map(c => ({
      title: c.title,
      students: students.filter(s => s.course === c.title).length,
    }))

    // Monthly stats — группируем студентов по дате регистрации (date_rage)
    const monthMap = {}
    students.forEach(s => {
      const d = new Date(s.date_rage)
      if (isNaN(d)) return
      const key = d.toLocaleString('en', { month: 'short' })
      if (!monthMap[key]) monthMap[key] = { month: key, students: 0, revenue: 0 }
      monthMap[key].students++
      // Примерная выручка = price курса студента
      const course = courses.find(c => c.title === s.course)
      monthMap[key].revenue += course?.price || 0
    })
    const monthly_stats = Object.values(monthMap)

    // Attendance monthly
    const attMonthMap = {}
    attendance.forEach(r => {
      const d = new Date(r.date)
      const key = d.toLocaleString('en', { month: 'short' })
      if (!attMonthMap[key]) attMonthMap[key] = { month: key, present: 0, absent: 0 }
      if (r.status === 'present') attMonthMap[key].present++
      else attMonthMap[key].absent++
    })
    const monthly_attendance = Object.values(attMonthMap)

    const attendanceRate = attendance.length > 0
      ? Math.round((attendance.filter(r => r.status === 'present').length / attendance.length) * 100)
      : 0

    return {
      paidCount,
      unpaidCount,
      totalStudents,
      totalRevenue,
      activeCoursesCount: courses.length,
      coursesDistribution,
      monthly_stats,
      monthly_attendance,
      attendanceRate,
    }
  }, [students, courses, attendance])

  const chartData = useMemo(() => {
    if (!data) return { courses: [], paid: [] }
    return {
      courses: data.coursesDistribution,
      paid: [
        { name: 'Paid', value: data.paidCount },
        { name: 'Unpaid', value: data.unpaidCount },
      ],
    }
  }, [data])

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>
  if (error) return (
    <div className="p-8 text-danger font-mono text-center">
      ⚠ Failed to load reports: {error}
    </div>
  )
  if (!data) return (
    <div className="p-8 text-txt-muted font-mono text-center">
      No data available yet. Add students and courses first.
    </div>
  )

  return (
    <div className="p-8 max-w-[1200px] animate-fade-in">
      <PageHeader tag="Analytics" title="Reports" />

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Est. Revenue',
            value: fmtM(data.totalRevenue) + 'M',
            sub: 'UZS (course × students)',
          },
          {
            label: 'Avg per Student',
            value: fmtM(Math.round(data.totalRevenue / (data.paidCount || 1))) + 'M',
            sub: 'UZS average',
          },
          {
            label: 'Collection Rate',
            value: `${Math.round((data.paidCount / (data.totalStudents || 1)) * 100)}%`,
            sub: `${data.paidCount} of ${data.totalStudents} paid`,
          },
          {
            label: 'Attendance Rate',
            value: `${data.attendanceRate}%`,
            sub: `${attendance.length} records logged`,
          },
        ].map(k => (
          <div key={k.label} className="card p-4">
            <div className="label">{k.label}</div>
            <div className="text-2xl font-bold text-txt">{k.value}</div>
            <div className="text-xs text-txt-muted mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Monthly charts */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="card p-5">
          <div className="text-sm font-semibold mb-1">Monthly Registrations</div>
          <div className="text-xs text-txt-muted mb-5">Students enrolled per month</div>
          {data.monthly_stats.length === 0 ? (
            <div className="text-xs text-txt-dim font-mono py-10 text-center">No registration data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.monthly_stats} barSize={20}>
                <CartesianGrid strokeDasharray="2 4" stroke="#1e1e28" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#696874', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#696874', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} width={24} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.05)' }} />
                <Bar dataKey="students" name="Students" fill="#7c3aed" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <div className="text-sm font-semibold mb-1">Revenue Trend</div>
          <div className="text-xs text-txt-muted mb-5">Est. monthly income (UZS)</div>
          {data.monthly_stats.length === 0 ? (
            <div className="text-xs text-txt-dim font-mono py-10 text-center">No revenue data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.monthly_stats}>
                <defs>
                  <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="#1e1e28" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#696874', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#696874', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} width={24} tickFormatter={v => fmtM(v)} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#282835' }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} fill="url(#revG)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Pie charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="text-sm font-semibold mb-1">Students by Course</div>
          <div className="text-xs text-txt-muted mb-4">Distribution across courses</div>
          {chartData.courses.every(c => c.students === 0) ? (
            <div className="text-xs text-txt-dim font-mono py-6 text-center">Assign students to courses first</div>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={chartData.courses}
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={70}
                    paddingAngle={2}
                    dataKey="students"
                  >
                    {chartData.courses.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, n) => [v + ' students', n]}
                    contentStyle={{ background: '#14141a', border: '1px solid #282835', borderRadius: 8, fontSize: 11, fontFamily: 'IBM Plex Mono' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 flex-1 max-h-[160px] overflow-y-auto">
                {chartData.courses.map((d, i) => (
                  <div key={d.title} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <div className="text-[11px] text-txt-muted flex-1 truncate">{d.title}</div>
                    <div className="text-[11px] font-mono text-txt">{d.students}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="text-sm font-semibold mb-1">Payment Status</div>
          <div className="text-xs text-txt-muted mb-4">Paid vs unpaid students</div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={chartData.paid}
                  cx="50%" cy="50%"
                  innerRadius={45} outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  <Cell fill="#10b981" strokeWidth={0} />
                  <Cell fill="#f43f5e" strokeWidth={0} />
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#14141a', border: '1px solid #282835', borderRadius: 8, fontSize: 11, fontFamily: 'IBM Plex Mono' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-xs text-txt-muted">Paid</span>
                </div>
                <div className="text-xl font-bold text-success font-mono">{data.paidCount}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-2 h-2 rounded-full bg-danger" />
                  <span className="text-xs text-txt-muted">Unpaid</span>
                </div>
                <div className="text-xl font-bold text-danger font-mono">{data.unpaidCount}</div>
              </div>
              <div className="text-[11px] font-mono text-txt-dim">
                {Math.round((data.paidCount / (data.totalStudents || 1)) * 100)}% collection rate
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
